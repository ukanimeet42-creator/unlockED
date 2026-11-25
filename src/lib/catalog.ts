import {
  Assessment,
  Course,
  Lesson,
  LessonChallenge,
  LessonExample,
  LessonQuizQuestion,
  LessonTheorySection,
} from "@/types";
import { REAL_COURSES, REAL_LESSONS } from "@/lib/data/course-data";

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export const COURSE_SLUG_TO_UUID: Record<string, string> = {
  "course-fullstack-nextjs": "22222222-2222-2222-2222-222222222201",
  "course-ai-llm-systems": "22222222-2222-2222-2222-222222222202",
  "course-cloud-devops": "22222222-2222-2222-2222-222222222203",
  "course-distributed-go": "22222222-2222-2222-2222-222222222204",
};

export const COURSE_UUID_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(COURSE_SLUG_TO_UUID).map(([slug, uuid]) => [uuid, slug])
);

export const LESSON_SLUG_TO_UUID: Record<string, string> = {
  "fs-l1": "33333333-3333-3333-3333-333333330101",
  "fs-l2": "33333333-3333-3333-3333-333333330102",
  "fs-l3": "33333333-3333-3333-3333-333333330103",
  "fs-l4": "33333333-3333-3333-3333-333333330104",
  "ai-l1": "33333333-3333-3333-3333-333333330201",
  "ai-l2": "33333333-3333-3333-3333-333333330202",
  "ai-l3": "33333333-3333-3333-3333-333333330203",
  "ai-l4": "33333333-3333-3333-3333-333333330204",
  "ops-l1": "33333333-3333-3333-3333-333333330301",
  "ops-l2": "33333333-3333-3333-3333-333333330302",
  "ops-l3": "33333333-3333-3333-3333-333333330303",
  "ops-l4": "33333333-3333-3333-3333-333333330304",
  "go-l1": "33333333-3333-3333-3333-333333330401",
  "go-l2": "33333333-3333-3333-3333-333333330402",
  "go-l3": "33333333-3333-3333-3333-333333330403",
  "go-l4": "33333333-3333-3333-3333-333333330404",
};

export const LESSON_UUID_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(LESSON_SLUG_TO_UUID).map(([slug, uuid]) => [uuid, slug])
);

export const COURSE_META: Record<
  string,
  { prerequisites: string[]; learning_outcomes: string[]; skill_id: string }
> = {
  "22222222-2222-2222-2222-222222222201": {
    prerequisites: ["HTML, CSS & JavaScript ES2023 fundamentals", "Basic SQL familiarity"],
    learning_outcomes: [
      "Architect React Server Components and Server Actions safely",
      "Model high-concurrency PostgreSQL queries with composite indexes",
      "Deploy resilient full-stack Next.js applications to production edge networks",
    ],
    skill_id: "11111111-1111-1111-1111-111111111102",
  },
  "22222222-2222-2222-2222-222222222202": {
    prerequisites: ["Python or TypeScript API integration basics", "Understanding of HTTP/JSON"],
    learning_outcomes: [
      "Build production RAG pipelines using pgvector hybrid semantic search",
      "Design ReAct tool-calling agent loops with strict validation guardrails",
      "Evaluate LLM faithfulness and reduce Time-to-First-Token latency",
    ],
    skill_id: "11111111-1111-1111-1111-111111111108",
  },
  "22222222-2222-2222-2222-222222222203": {
    prerequisites: ["Linux command-line essentials", "Basic Git workflow experience"],
    learning_outcomes: [
      "Build hardened multi-stage non-root distroless container images",
      "Operate multi-replica Kubernetes workloads with readiness/liveness probes",
      "Monitor the Four Golden Signals in Prometheus and automate Canary rollbacks",
    ],
    skill_id: "11111111-1111-1111-1111-111111111105",
  },
  "22222222-2222-2222-2222-222222222204": {
    prerequisites: ["Systems programming basics in any language", "Networking HTTP/TCP basics"],
    learning_outcomes: [
      "Implement bounded worker pools, graceful context cancellation, and backpressure",
      "Build gRPC + Redis + PostgreSQL concurrent microservices in Go",
      "Diagnose memory spikes and goroutine leaks using runtime/pprof",
    ],
    skill_id: "11111111-1111-1111-1111-111111111103",
  },
};

export function resolveCourseUuid(idOrSlug: string): string {
  if (isUuid(idOrSlug)) return idOrSlug;
  return COURSE_SLUG_TO_UUID[idOrSlug] || idOrSlug;
}

export function resolveLessonUuid(idOrSlug: string): string {
  if (isUuid(idOrSlug)) return idOrSlug;
  return LESSON_SLUG_TO_UUID[idOrSlug] || idOrSlug;
}

export interface SerializedLessonPayload {
  version: 2;
  slug?: string;
  summary?: string;
  learning_objectives?: string[];
  theory_sections?: LessonTheorySection[];
  examples?: LessonExample[];
  quiz?: LessonQuizQuestion[];
  challenge?: LessonChallenge;
  markdown?: string;
}

/**
 * Serializes rich structured lesson objects into lessons.content JSON string
 * for clean persistence inside PostgreSQL TEXT column.
 */
export function serializeLessonContent(lesson: Lesson): string {
  const payload: SerializedLessonPayload = {
    version: 2,
    slug: LESSON_UUID_TO_SLUG[lesson.id] || lesson.slug || lesson.id,
    summary: lesson.summary,
    learning_objectives: lesson.learning_objectives,
    theory_sections: lesson.theory_sections,
    examples: lesson.examples,
    quiz: lesson.quiz,
    challenge: lesson.challenge,
    markdown: lesson.content,
  };
  return JSON.stringify(payload);
}

/**
 * Hydrates a database lesson row into a rich Lesson entity, supporting both
 * structured v2 JSON content and plain Markdown strings.
 */
export function hydrateLesson(row: Record<string, unknown>): Lesson {
  const rawId = String(row.id);
  const rawCourseId = String(row.course_id);
  const contentRaw = typeof row.content === "string" ? row.content : "";

  let parsed: SerializedLessonPayload | null = null;
  if (contentRaw.trim().startsWith("{")) {
    try {
      const candidate = JSON.parse(contentRaw) as SerializedLessonPayload;
      if (candidate && candidate.version === 2) {
        parsed = candidate;
      }
    } catch {
      parsed = null;
    }
  }

  // Fallback enrichment from static curriculum if DB row has plain markdown
  const slug = parsed?.slug || LESSON_UUID_TO_SLUG[rawId];
  const courseSlug = COURSE_UUID_TO_SLUG[rawCourseId] || rawCourseId;
  const fallbackLesson =
    (REAL_LESSONS[courseSlug] || []).find((l) => l.id === slug || l.id === rawId) || null;

  return {
    id: rawId,
    slug: slug || rawId,
    course_id: rawCourseId,
    title: String(row.title || fallbackLesson?.title || "Lesson"),
    content: parsed?.markdown || contentRaw || fallbackLesson?.content || "",
    order_index: Number(row.order_index ?? fallbackLesson?.order_index ?? 1),
    duration_minutes: row.duration_minutes ? Number(row.duration_minutes) : fallbackLesson?.duration_minutes ?? 30,
    video_url: (row.video_url as string | null) ?? null,
    is_published: row.is_published !== false,
    created_at: String(row.created_at || new Date().toISOString()),
    updated_at: String(row.updated_at || new Date().toISOString()),
    summary: parsed?.summary || fallbackLesson?.summary,
    learning_objectives: parsed?.learning_objectives || fallbackLesson?.learning_objectives,
    theory_sections:
      parsed?.theory_sections ||
      fallbackLesson?.theory_sections ||
      (contentRaw && !parsed
        ? [{ heading: "Lesson Overview", body: contentRaw }]
        : undefined),
    examples: parsed?.examples || fallbackLesson?.examples,
    quiz: parsed?.quiz || fallbackLesson?.quiz,
    challenge: parsed?.challenge || fallbackLesson?.challenge,
  };
}

export function hydrateCourse(row: Record<string, unknown>, lessonCount?: number): Course {
  const rawId = String(row.id);
  const slug = COURSE_UUID_TO_SLUG[rawId];
  const meta = COURSE_META[rawId];
  return {
    id: rawId,
    slug,
    title: String(row.title || ""),
    description: String(row.description || ""),
    short_description: (row.short_description as string | null) ?? null,
    thumbnail_url: (row.thumbnail_url as string | null) ?? null,
    category: String(row.category || "Full-Stack Development"),
    difficulty: (row.difficulty as Course["difficulty"]) || "intermediate",
    duration_weeks: Number(row.duration_weeks ?? 8),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    is_published: row.is_published !== false,
    created_by: String(row.created_by || "system"),
    created_at: String(row.created_at || new Date().toISOString()),
    updated_at: String(row.updated_at || new Date().toISOString()),
    lesson_count: lessonCount ?? Number(row.lesson_count ?? 4),
    enrolled_count: Number(row.enrolled_count ?? 0),
    prerequisites: meta?.prerequisites || [],
    learning_outcomes: meta?.learning_outcomes || [],
  };
}

/**
 * Returns normalized courses + lessons with deterministic Postgres UUIDs.
 */
export function getNormalizedSeedCurriculum() {
  const courses = REAL_COURSES.map((c) => {
    const uuid = resolveCourseUuid(c.id);
    const meta = COURSE_META[uuid];
    return {
      ...c,
      id: uuid,
      slug: c.id,
      prerequisites: meta?.prerequisites || [],
      learning_outcomes: meta?.learning_outcomes || [],
    };
  });

  const lessons: Lesson[] = [];
  for (const [courseSlug, items] of Object.entries(REAL_LESSONS)) {
    const courseUuid = resolveCourseUuid(courseSlug);
    for (const item of items) {
      lessons.push({
        ...item,
        slug: item.id,
        id: resolveLessonUuid(item.id),
        course_id: courseUuid,
      });
    }
  }

  return { courses, lessons };
}

/**
 * Server-calibrated benchmark assessments mapped 1:1 to published courses and skills.
 */
export const PRODUCTION_ASSESSMENTS: Omit<Assessment, "created_by" | "created_at" | "updated_at">[] = [
  {
    id: "44444444-4444-4444-4444-444444444401",
    title: "Full-Stack Next.js 15, RSC & PostgreSQL Benchmark",
    description:
      "Evaluate mastery of React Server Components, Server Actions CSRF & Zod validation, PostgreSQL indexing, and edge caching semantics.",
    course_id: "22222222-2222-2222-2222-222222222201",
    skill_id: "11111111-1111-1111-1111-111111111102",
    time_limit_minutes: 15,
    passing_score: 70,
    total_questions: 4,
    is_published: true,
    questions: [
      {
        id: "nq-1",
        question: "Why are React Server Components (RSC) ideal for database-heavy SaaS dashboards?",
        options: [
          "They compile to WebAssembly and run inside browser workers",
          "They execute exclusively on the server, keeping DB credentials/ORM libraries out of the browser bundle",
          "They disable SQL authentication automatically",
          "They eliminate the need for semantic HTML",
        ],
        correct_answer: 1,
        explanation: "RSCs execute solely on the server so heavy dependencies and credentials never ship to the client bundle.",
        points: 25,
      },
      {
        id: "nq-2",
        question: "What happens if an async page awaits multiple sequential database queries without Suspense boundaries?",
        options: [
          "Next.js automatically caches all private mutations",
          "The entire route HTML response stalls until the slowest query completes",
          "The browser parses JavaScript faster",
          "PostgreSQL automatically upgrades indexes",
        ],
        correct_answer: 1,
        explanation: "Wrapping slow data fetches in <Suspense> allows shell streaming while data resolves progressively.",
        points: 25,
      },
      {
        id: "nq-3",
        question: "In PostgreSQL, what is the primary difference between a B-Tree index and a Hash index?",
        options: [
          "B-Tree supports range & equality queries (<, <=, =, >=, >) and sorting, while Hash supports only = equality",
          "Hash indexes support ORDER BY whereas B-Tree cannot",
          "B-Tree indexes cannot index UUID strings",
          "Hash indexes prevent deadlocks automatically",
        ],
        correct_answer: 0,
        explanation: "B-Tree is PostgreSQL's default index supporting ranges, ordering, and equality; Hash only supports =.",
        points: 25,
      },
      {
        id: "nq-4",
        question: "Which rule is mandatory for every Next.js Server Action performing a state mutation?",
        options: [
          "Trust IDs provided in hidden form fields",
          "Verify caller authentication/session, authorize resource ownership, and validate payloads with Zod on the server",
          "Disable cookies during POST requests",
          "Always call router.refresh() inside SQL",
        ],
        correct_answer: 1,
        explanation: "Server Actions are HTTP POST endpoints; authentication, ownership authorization, and Zod validation must execute server-side.",
        points: 25,
      },
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444402",
    title: "Production AI, RAG & Autonomous Agents Benchmark",
    description:
      "Assess knowledge of pgvector cosine operators, hybrid search, ReAct loops, prompt injection defenses, and TTFT optimization.",
    course_id: "22222222-2222-2222-2222-222222222202",
    skill_id: "11111111-1111-1111-1111-111111111108",
    time_limit_minutes: 15,
    passing_score: 70,
    total_questions: 4,
    is_published: true,
    questions: [
      {
        id: "aq-1",
        question: "In PostgreSQL pgvector, which operator computes cosine distance between two vectors?",
        options: ["<=>", "<->", "<#>", "@@"],
        correct_answer: 0,
        explanation: "<=> calculates cosine distance, <-> computes L2 Euclidean distance, and <#> computes negative inner product.",
        points: 25,
      },
      {
        id: "aq-2",
        question: "Why does hybrid RAG combine dense vector search with lexical BM25 / full-text search?",
        options: [
          "To double token usage per request",
          "Dense embeddings miss exact identifiers (error codes, SKUs, symbols) that lexical matching retrieves reliably",
          "Vector indexes cannot filter by user_id",
          "Lexical search replaces LLM generation",
        ],
        correct_answer: 1,
        explanation: "Semantic vectors struggle with rare exact literals; combining semantic + keyword RRF yields much higher recall.",
        points: 25,
      },
      {
        id: "aq-3",
        question: "In an autonomous ReAct tool-calling agent, why is a hard max-iteration and schema validation budget mandatory?",
        options: [
          "To prevent infinite reasoning loops, runaway API spend, and malformed tool arguments",
          "To speed up CSS rendering",
          "Because PostgreSQL limits queries to 3 steps",
          "To disable structured outputs",
        ],
        correct_answer: 0,
        explanation: "Agents can loop indefinitely on ambiguous errors unless bounded by explicit step limits and strict Zod/JSON schemas.",
        points: 25,
      },
      {
        id: "aq-4",
        question: "What metric measures latency from sending an LLM prompt until the client receives its first generated token?",
        options: [
          "TTFT (Time To First Token)",
          "MTTF (Mean Time To Failure)",
          "BTree Height",
          "Batch Epoch Latency",
        ],
        correct_answer: 0,
        explanation: "TTFT determines perceived responsiveness in streaming conversational interfaces.",
        points: 25,
      },
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444403",
    title: "Cloud SRE, Docker Security & Kubernetes Benchmark",
    description:
      "Validate multi-stage container hardening, Kubernetes readiness vs liveness semantics, GitOps pipelines, and Four Golden Signals SRE.",
    course_id: "22222222-2222-2222-2222-222222222203",
    skill_id: "11111111-1111-1111-1111-111111111105",
    time_limit_minutes: 15,
    passing_score: 70,
    total_questions: 4,
    is_published: true,
    questions: [
      {
        id: "oq-1",
        question: "What is the primary security reason to use distroless non-root container images in production?",
        options: [
          "They remove shell interpreters and package managers, reducing container breakout & RCE attack surface",
          "They grant root access without credentials",
          "They bypass Kubernetes NetworkPolicies",
          "They encrypt HTTP payloads automatically",
        ],
        correct_answer: 0,
        explanation: "Distroless images run an unprivileged binary with no bash/curl/apt present for attackers to invoke.",
        points: 25,
      },
      {
        id: "oq-2",
        question: "When a Kubernetes pod fails its readinessProbe but passes livenessProbe, what happens?",
        options: [
          "The pod is immediately killed and recreated",
          "The pod is removed from Service Endpoints so no traffic routes to it, without restarting it",
          "The entire node reboots",
          "PersistentVolumes are wiped",
        ],
        correct_answer: 1,
        explanation: "Readiness gates Service traffic; Liveness triggers container restarts on deadlock.",
        points: 25,
      },
      {
        id: "oq-3",
        question: "How does GitOps enforce auditability across Kubernetes clusters?",
        options: [
          "Operators SSH into nodes for manual patching",
          "Declarative manifests live in Git as the single source of truth; in-cluster controllers reconcile drift automatically",
          "Secrets are committed in plaintext to public branches",
          "kubectl delete runs on every commit",
        ],
        correct_answer: 1,
        explanation: "Every change flows through reviewed Git commits reconciled continuously by ArgoCD/Flux.",
        points: 25,
      },
      {
        id: "oq-4",
        question: "Which set correctly names the Google SRE Four Golden Signals?",
        options: [
          "Latency, Traffic, Errors, Saturation",
          "CPU, Memory, Disk IOPS, Bandwidth",
          "Replicas, Pods, Services, Ingress",
          "Build Time, LoC, PR Count, Uptime",
        ],
        correct_answer: 0,
        explanation: "Latency, Traffic, Errors, and Saturation provide complete user-symptom coverage for distributed services.",
        points: 25,
      },
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444404",
    title: "Distributed Go Microservices & Concurrency Benchmark",
    description:
      "Benchmark command over unbuffered/buffered Go channels, bounded worker pools, context propagation, and pprof diagnostics.",
    course_id: "22222222-2222-2222-2222-222222222204",
    skill_id: "11111111-1111-1111-1111-111111111103",
    time_limit_minutes: 15,
    passing_score: 70,
    total_questions: 4,
    is_published: true,
    questions: [
      {
        id: "gq-1",
        question: "What happens when a goroutine sends to an unbuffered channel (make(chan T)) with no receiver waiting?",
        options: [
          "The value is dropped silently",
          "The sending goroutine blocks until another goroutine receives from the channel",
          "Go spawns a background thread pool automatically",
          "The runtime panics immediately",
        ],
        correct_answer: 1,
        explanation: "Unbuffered channels synchronize sender and receiver, blocking until rendezvous completes.",
        points: 25,
      },
      {
        id: "gq-2",
        question: "Why should a Go HTTP server pass r.Context() downstream into database calls and gRPC requests?",
        options: [
          "To convert JSON into Protobuf",
          "So canceled client connections or deadline expirations promptly abort downstream work and prevent resource leaks",
          "To increase TCP window sizes",
          "To disable connection pooling",
        ],
        correct_answer: 1,
        explanation: "Context propagation cancels in-flight SQL/RPC work when a caller disconnects or SLA expires.",
        points: 25,
      },
      {
        id: "gq-3",
        question: "Which tool diagnoses a suspected goroutine leak in a running Go production microservice?",
        options: [
          "pprof goroutine profile (/debug/pprof/goroutine)",
          "gofmt -s",
          "go mod tidy",
          "sqlc generate",
        ],
        correct_answer: 0,
        explanation: "net/http/pprof reveals stack traces and exact counts of blocked goroutines leaking in memory.",
        points: 25,
      },
      {
        id: "gq-4",
        question: "How does a bounded worker pool protect PostgreSQL during a sudden traffic burst?",
        options: [
          "It opens unlimited goroutines and connections per request",
          "It caps concurrent workers + applies backpressure, preventing DB connection exhaustion and cascading OOM failures",
          "It drops all HTTP headers",
          "It disables TLS",
        ],
        correct_answer: 1,
        explanation: "Bounded concurrency limits active downstream saturation and protects shared connection pools.",
        points: 25,
      },
    ],
  },
];
