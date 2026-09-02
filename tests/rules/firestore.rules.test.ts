import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const PROJECT_ID = "sketchplan-rules-test";
let testEnvironment: RulesTestEnvironment;

const baseService = {
  title: "Architecture Design",
  slug: "architecture-design",
  shortDescription: "A clear architectural design service.",
  description: "Architecture services planned around the project brief.",
  imageUrl: "",
  imageAlt: "",
  featured: true,
  published: true,
  displayOrder: 1,
};

const validLead = {
  name: "Example Client",
  phone: "+91 9000000000",
  email: "client@example.com",
  service: "Architecture Design",
  message: "I would like to discuss a residential project.",
  source: "website",
  status: "NEW",
  adminNotes: "",
  createdAt: serverTimestamp(),
};

async function seedAdmin(
  uid: string,
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR",
  active = true,
) {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "admins", uid), {
      uid,
      name: `${role} User`,
      email: `${uid}@example.com`,
      role,
      active,
      createdAt: Timestamp.now(),
    });
  });
}

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
  await seedAdmin("super-user", "SUPER_ADMIN");
  await seedAdmin("admin-user", "ADMIN");
  await seedAdmin("editor-user", "EDITOR");
  await seedAdmin("inactive-user", "ADMIN", false);
});

afterAll(async () => {
  await testEnvironment.cleanup();
});

describe("public content access", () => {
  it("allows published services and rejects unpublished services", async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "services", "published"), {
        ...baseService,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await setDoc(doc(context.firestore(), "services", "draft"), {
        ...baseService,
        slug: "draft",
        published: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    const anonymous = testEnvironment.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(anonymous, "services", "published")));
    await assertFails(getDoc(doc(anonymous, "services", "draft")));
  });

  it("allows only visibility-filtered public list queries", async () => {
    const anonymous = testEnvironment.unauthenticatedContext().firestore();
    await assertSucceeds(
      getDocs(
        query(
          collection(anonymous, "services"),
          where("published", "==", true),
          orderBy("displayOrder", "asc"),
        ),
      ),
    );
    await assertFails(getDocs(collection(anonymous, "services")));
  });

  it("rejects anonymous website-content writes", async () => {
    const anonymous = testEnvironment.unauthenticatedContext().firestore();
    await assertFails(
      setDoc(doc(anonymous, "services", "anonymous-write"), {
        ...baseService,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });
});

describe("public lead boundary", () => {
  it("allows a valid new lead", async () => {
    const anonymous = testEnvironment.unauthenticatedContext().firestore();
    await assertSucceeds(addDoc(collection(anonymous, "leads"), validLead));
  });

  it.each([
    ["non-new status", { ...validLead, status: "CONTACTED" }],
    ["admin notes", { ...validLead, adminNotes: "public note" }],
    ["unknown fields", { ...validLead, role: "SUPER_ADMIN" }],
    ["oversized message", { ...validLead, message: "x".repeat(5_001) }],
  ])("rejects %s", async (_label, payload) => {
    const anonymous = testEnvironment.unauthenticatedContext().firestore();
    await assertFails(addDoc(collection(anonymous, "leads"), payload));
  });

  it("prevents anonymous lead reads and updates", async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "leads", "private-lead"), {
        ...validLead,
        createdAt: Timestamp.now(),
      });
    });
    const anonymous = testEnvironment.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anonymous, "leads", "private-lead")));
    await assertFails(
      updateDoc(doc(anonymous, "leads", "private-lead"), {
        status: "CONVERTED",
      }),
    );
  });
});

describe("admin roles", () => {
  it("allows active editors to manage content", async () => {
    const editor = testEnvironment
      .authenticatedContext("editor-user")
      .firestore();
    await assertSucceeds(
      setDoc(doc(editor, "services", "editor-service"), {
        ...baseService,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("rejects content writes from inactive admins", async () => {
    const inactive = testEnvironment
      .authenticatedContext("inactive-user")
      .firestore();
    await assertFails(
      setDoc(doc(inactive, "services", "inactive-service"), {
        ...baseService,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("lets an inactive user read only their own admin record", async () => {
    const inactive = testEnvironment
      .authenticatedContext("inactive-user")
      .firestore();
    await assertSucceeds(getDoc(doc(inactive, "admins", "inactive-user")));
    await assertFails(getDoc(doc(inactive, "admins", "admin-user")));
  });

  it("allows editors to read leads but only admins to update them", async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "leads", "role-lead"), {
        ...validLead,
        createdAt: Timestamp.now(),
      });
    });
    const editor = testEnvironment
      .authenticatedContext("editor-user")
      .firestore();
    const admin = testEnvironment
      .authenticatedContext("admin-user")
      .firestore();

    await assertSucceeds(getDoc(doc(editor, "leads", "role-lead")));
    await assertFails(
      updateDoc(doc(editor, "leads", "role-lead"), {
        status: "CONTACTED",
        adminNotes: "Called",
        updatedAt: serverTimestamp(),
      }),
    );
    await assertSucceeds(
      updateDoc(doc(admin, "leads", "role-lead"), {
        status: "CONTACTED",
        adminNotes: "Called",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("prevents editors from writing sensitive settings", async () => {
    const editor = testEnvironment
      .authenticatedContext("editor-user")
      .firestore();
    await assertFails(
      setDoc(doc(editor, "siteSettings", "social"), {
        facebookUrl: "",
        instagramUrl: "",
        linkedInUrl: "",
        youtubeUrl: "",
        whatsappUrl: "",
        updatedAt: serverTimestamp(),
      }),
    );
  });
});
