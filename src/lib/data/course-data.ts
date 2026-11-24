import { Course, Lesson, Skill } from "@/types";

export const REAL_SKILLS: Skill[] = [
  {
    id: "s1",
    name: "TypeScript & Next.js",
    category: "Frontend",
    description: "Production React 19 architecture, Next.js 15 App Router, and strict TypeScript engineering.",
    icon: "code",
    created_at: new Date().toISOString(),
  },
  {
    id: "s2",
    name: "Go (Golang)",
    category: "Backend",
    description: "High-throughput concurrent microservices, memory profiling, and distributed systems in Go.",
    icon: "terminal",
    created_at: new Date().toISOString(),
  },
  {
    id: "s3",
    name: "AI & LLM Engineering",
    category: "AI/ML",
    description: "Enterprise RAG architectures, vector embeddings, Gemini API integration, and tool-calling agents.",
    icon: "sparkles",
    created_at: new Date().toISOString(),
  },
  {
    id: "s4",
    name: "Docker & Kubernetes",
    category: "DevOps",
    description: "Cloud-native container orchestration, zero-downtime rolling updates, and cluster reliability.",
    icon: "box",
    created_at: new Date().toISOString(),
  },
  {
    id: "s5",
    name: "PostgreSQL & Redis",
    category: "Database",
    description: "Relational database indexing, distributed caching, ACID transactions, and Redis pub/sub.",
    icon: "database",
    created_at: new Date().toISOString(),
  },
  {
    id: "s6",
    name: "System Design & SRE",
    category: "Backend",
    description: "High-availability system design, Prometheus telemetry, distributed tracing, and SLA governance.",
    icon: "network",
    created_at: new Date().toISOString(),
  },
];

export const REAL_COURSES: Course[] = [
  {
    id: "course-fullstack-nextjs",
    title: "Full-Stack Architecture with Next.js 15, TypeScript & React 19",
    description:
      "Architect and deploy production-grade web applications. Master React Server Components (RSC), Server Actions, optimistic mutations, edge caching, and scalable state management.",
    short_description: "Master modern full-stack engineering with Next.js 15 App Router, TypeScript, and React 19.",
    thumbnail_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    category: "Full-Stack Development",
    difficulty: "intermediate",
    duration_weeks: 8,
    tags: ["Next.js 15", "TypeScript", "React 19", "Server Actions", "PostgreSQL", "Tailwind CSS"],
    is_published: true,
    created_by: "system",
    created_at: "2024-11-20T00:00:00.000Z",
    updated_at: "2024-11-20T00:00:00.000Z",
    lesson_count: 4,
    enrolled_count: 0,
  },
  {
    id: "course-distributed-go",
    title: "Distributed Systems & Microservices Engineering with Go",
    description:
      "Engineer fault-tolerant backend platforms using Go. Master Goroutines, channels, worker pools, gRPC communication, distributed Redis caching, and event-driven architectures.",
    short_description: "Build high-throughput, concurrent microservices and resilient distributed backends with Go.",
    thumbnail_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    category: "Backend Development",
    difficulty: "advanced",
    duration_weeks: 10,
    tags: ["Go (Golang)", "Concurrency", "gRPC", "Redis", "Kafka", "Microservices"],
    is_published: true,
    created_by: "system",
    created_at: "2024-11-20T00:00:00.000Z",
    updated_at: "2024-11-20T00:00:00.000Z",
    lesson_count: 4,
    enrolled_count: 0,
  },
  {
    id: "course-ai-llm-systems",
    title: "Production AI & LLM Systems: Enterprise RAG & Autonomous Agents",
    description:
      "Build production-ready AI applications. Learn structured prompt engineering, vector embeddings, hybrid semantic search, retrieval-augmented generation (RAG), and autonomous agent loops.",
    short_description: "Master enterprise RAG pipelines, vector databases, and multi-step AI agent architectures.",
    thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    category: "AI & Machine Learning",
    difficulty: "advanced",
    duration_weeks: 8,
    tags: ["Python", "Gemini API", "Vector Embeddings", "RAG", "LangGraph", "Autonomous Agents"],
    is_published: true,
    created_by: "system",
    created_at: "2024-11-20T00:00:00.000Z",
    updated_at: "2024-11-20T00:00:00.000Z",
    lesson_count: 4,
    enrolled_count: 0,
  },
  {
    id: "course-cloud-devops",
    title: "Cloud Infrastructure, Docker & Kubernetes Engineering (SRE)",
    description:
      "Deploy scalable, highly available infrastructure. Master multi-stage Docker builds, Kubernetes cluster management, GitOps deployment pipelines, and Prometheus observability.",
    short_description: "Deploy fault-tolerant container clusters and master Kubernetes, CI/CD, and SRE observability.",
    thumbnail_url: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80",
    category: "DevOps & Cloud",
    difficulty: "intermediate",
    duration_weeks: 8,
    tags: ["Docker", "Kubernetes", "CI/CD", "Prometheus", "Terraform", "GitOps"],
    is_published: true,
    created_by: "system",
    created_at: "2024-11-20T00:00:00.000Z",
    updated_at: "2024-11-20T00:00:00.000Z",
    lesson_count: 4,
    enrolled_count: 0,
  },
];

export const REAL_LESSONS: Record<string, Lesson[]> = {
  // ==========================================
  // Track 1: Next.js 15 & React 19
  // ==========================================
  "course-fullstack-nextjs": [
    {
      id: "fs-l1",
      course_id: "course-fullstack-nextjs",
      title: "App Router Architecture & React Server Components (RSC)",
      order_index: 1,
      duration_minutes: 45,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Understand the React Server Component paradigm, server-client boundaries, and streaming rendering.",
      learning_objectives: [
        "Explain how React Server Components (RSC) eliminate client-side JavaScript overhead",
        "Properly identify when to use 'use client' directives versus keeping components on the server",
        "Implement streaming server rendering with React Suspense for zero-latency user feedback",
      ],
      theory_sections: [
        {
          heading: "1. The Server Component Paradigm",
          body: "React Server Components (RSC) run strictly on the server node. Unlike traditional React rendering where components run on both server and client (hydration), RSC renders directly to an intermediate virtual DOM representation (RSC payload) and streams to the client browser. No JavaScript dependencies of the server component are added to the client bundle.",
          key_points: [
            "Server components reduce client bundle size to virtually 0KB for data-fetching logic.",
            "Database drivers, ORMs, and private API keys remain secure on the server without exposure.",
            "Data fetching can be executed close to the data source without round-trip waterfall penalties.",
          ],
        },
        {
          heading: "2. The Server-Client Boundary & Props Serialization",
          body: "When an interactive client component is required (e.g., event listeners like onClick, hooks like useState or useEffect), you declare the 'use client' directive at the top of the file. Any props passed across this boundary must be JSON-serializable.",
          key_points: [
            "'use client' does NOT mean client-only; it means 'opt into client hydration'.",
            "Functions, classes, and circular objects cannot be passed across the boundary as plain props.",
            "Composition pattern: Pass Server Components as 'children' to Client Components to avoid re-rendering children on client state changes.",
          ],
        },
        {
          heading: "3. Streaming SSR & Progressive Hydration",
          body: "Next.js App Router leverages HTTP chunked transfer encoding and React 19's <Suspense> boundary. The browser receives the initial shell instantly while slow asynchronous database queries stream in parallel.",
          key_points: [
            "Prevents slow database queries from blocking the First Contentful Paint (FCP).",
            "Individual Suspense boundaries hydrate independently as their data streams complete.",
          ],
        },
      ],
      examples: [
        {
          title: "Streaming Server Component with Suspense Fallback",
          language: "tsx",
          code: `// app/analytics/page.tsx (Server Component by default)
import { Suspense } from "react";
import { UserMetricsList } from "./user-metrics-list";
import { SkeletonMetrics } from "./skeleton-metrics";

async function fetchRealtimeMetrics() {
  // Direct server-side data fetch without client waterfalls
  const res = await fetch("https://api.internal/metrics", {
    next: { revalidate: 60 }, // Incremental Static Regeneration (ISR)
  });
  if (!res.ok) throw new Error("Metrics service unavailable");
  return res.json();
}

export default async function AnalyticsPage() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">System Telemetry</h1>
      <Suspense fallback={<SkeletonMetrics />}>
        <AsyncMetricsSection />
      </Suspense>
    </div>
  );
}

async function AsyncMetricsSection() {
  const data = await fetchRealtimeMetrics();
  return <UserMetricsList metrics={data} />;
}`,
          explanation: "The initial page shell renders immediately. The AsyncMetricsSection streams in as soon as the fetch resolves.",
          output: "HTTP 200 chunked stream -> instant shell -> hydrated metrics cards",
        },
      ],
      quiz: [
        {
          id: "fs-q1",
          question: "What happens to the JavaScript bundle of a component that does NOT have 'use client'?",
          options: [
            "It is bundled and sent to the client browser along with React runtime",
            "It runs only on the server; zero component JavaScript is shipped to the browser",
            "It is evaluated in a client Web Worker in background",
            "It gets automatically converted to a Web Component",
          ],
          correctIndex: 1,
          explanation: "Server Components execute solely on the server. Next.js strips out their JS code and sends only the rendered RSC payload, resulting in smaller bundle sizes.",
        },
        {
          id: "fs-q2",
          question: "Which prop type CANNOT be passed from a Server Component to a Client Component?",
          options: [
            "A plain JavaScript array of objects",
            "A string or number primitive",
            "A standard JavaScript callback function (e.g. () => void)",
            "A boolean flag",
          ],
          correctIndex: 2,
          explanation: "Props crossing the Server/Client boundary must be JSON-serializable. Functions cannot be serialized across HTTP boundaries without using Server Actions.",
        },
        {
          id: "fs-q3",
          question: "How do you prevent a slow data query in an async Server Component from blocking the entire page load?",
          options: [
            "Wrap the async component with React's <Suspense fallback={<Loading />}> boundary",
            "Convert the page to a static HTML file",
            "Use setTimeout inside the database driver",
            "Move the data fetching logic into a CSS animation",
          ],
          correctIndex: 0,
          explanation: "Wrapping the async component in a Suspense boundary enables HTTP streaming: the page shell loads instantly and the async chunk streams in when ready.",
        },
      ],
      challenge: {
        prompt: "Refactor a legacy client-side useEffect fetch into an async Server Component with Suspense streaming and error boundary handling.",
        starter_code: `// Refactor this legacy client component into a modern Server Component
"use client";
import { useState, useEffect } from "react";

export function UserProfile({ id }: { id: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(\`/api/users/\${id}\`)
      .then(r => r.json())
      .then(d => { setUser(d); setLoading(false); });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  return <div>{user.name} ({user.email})</div>;
}`,
        solution_code: `// Modern Next.js 15 Server Component
import { Suspense } from "react";

async function getUser(id: string) {
  const res = await fetch(\`https://api.internal/users/\${id}\`, {
    next: { tags: [\`user-\${id}\`] }
  });
  return res.json();
}

export async function UserProfile({ id }: { id: string }) {
  const user = await getUser(id);
  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
      <h3 className="font-bold text-white">{user.name}</h3>
      <p className="text-sm text-slate-400">{user.email}</p>
    </div>
  );
}`,
        explanation: "By making the component an async Server Component, you eliminate the client fetch waterfall, state variables, and extra re-renders.",
      },
      content: "Detailed comprehensive breakdown of Next.js 15 App Router architecture and React Server Components.",
    },
    {
      id: "fs-l2",
      course_id: "course-fullstack-nextjs",
      title: "Server Actions, Optimistic UI & Mutation Resilience",
      order_index: 2,
      duration_minutes: 50,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Build bulletproof form mutations with Next.js Server Actions, revalidatePath, and React 19 useOptimistic.",
      learning_objectives: [
        "Design type-safe Server Actions with Zod input validation",
        "Implement React 19 useOptimistic for zero-latency client feedback",
        "Master cache invalidation using revalidatePath and revalidateTag",
      ],
      theory_sections: [
        {
          heading: "1. What are Server Actions?",
          body: "Server Actions are asynchronous functions that execute on the server. They can be invoked directly from HTML forms or JavaScript event handlers, eliminating the need to manually write boilerplate REST API endpoints (/api/...) for mutations.",
          key_points: [
            "Can be invoked even before client-side JavaScript has finished loading (progressive enhancement).",
            "Automatically manage POST requests, CSRF protection, and cookies under the hood.",
          ],
        },
        {
          heading: "2. Optimistic UI Updates with React 19",
          body: "React 19's useOptimistic hook allows developers to immediately update the interface with predicted state before the server response returns, reverting automatically if the server mutation throws an error.",
          key_points: [
            "Delivers 0ms perceived latency on user actions like liking a post or adding an item to a cart.",
            "Maintains full synchronization with server truth without manual rollback bookkeeping.",
          ],
        },
      ],
      examples: [
        {
          title: "Type-Safe Server Action with Zod and Revalidation",
          language: "tsx",
          code: `// app/actions/create-project.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const ProjectSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
});

export async function createProjectAction(formData: FormData) {
  const parsed = ProjectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Insert into production DB
  await db.project.create({ data: parsed.data });

  // Invalidate cache and trigger real-time RSC refresh
  revalidatePath("/student/portfolio");
  return { success: true };
}`,
          explanation: "The 'use server' directive marks this function as a secure Server Action. Next.js generates an internal RPC endpoint with automatic CSRF tokens.",
        },
      ],
      quiz: [
        {
          id: "fs-q4",
          question: "What directive must be placed at the top of a file or function to declare a Next.js Server Action?",
          options: ["'use server'", "'use action'", "'use api'", "'use backend'"],
          correctIndex: 0,
          explanation: "The 'use server' directive designates that the function or file should be executed exclusively on the server as an RPC handler.",
        },
        {
          id: "fs-q5",
          question: "Which Next.js cache API is used inside a Server Action to purge cached RSC data for a route?",
          options: ["revalidatePath()", "cache.clear()", "localStorage.removeItem()", "window.reload()"],
          correctIndex: 0,
          explanation: "revalidatePath() purges the cached data for the specified path, allowing Next.js to re-render the Server Component with fresh data.",
        },
      ],
      content: "Complete guide to Server Actions, React 19 useOptimistic, and cache invalidation strategies.",
    },
    {
      id: "fs-l3",
      course_id: "course-fullstack-nextjs",
      title: "Authentication, Middleware & Role-Based Access Control (RBAC)",
      order_index: 3,
      duration_minutes: 55,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Implement production-grade session security, Edge Middleware route protection, and RBAC guards.",
      learning_objectives: [
        "Configure Edge Middleware to inspect JWT cookies before request routing",
        "Implement multi-role permission guards for Student, Recruiter, and Admin",
        "Mitigate OWASP security vulnerabilities (CSRF, XSS, and Session Hijacking)",
      ],
      theory_sections: [
        {
          heading: "1. Edge Middleware Architecture",
          body: "Next.js Middleware runs at the Edge before a request is completed. It allows inspecting headers, validating session tokens, and redirecting unauthenticated users with sub-5ms latency before hitting serverless functions or databases.",
          key_points: [
            "Runs on lightweight V8 Edge runtimes without Node.js standard libraries.",
            "Provides centralized route protection preventing unauthorized access to protected dashboard paths.",
          ],
        },
      ],
      examples: [
        {
          title: "Edge Route Guard for Role Protection",
          language: "ts",
          code: `// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/login?redirect=" + path, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/recruiter/:path*", "/admin/:path*"],
};`,
          explanation: "Validates session tokens at the network edge before any compute or database load occurs.",
        },
      ],
      quiz: [
        {
          id: "fs-q6",
          question: "Where does Next.js Middleware execute?",
          options: [
            "At the Edge before the request hits the route handler or page",
            "In the user's browser after JavaScript hydration",
            "Only in the background queue worker",
            "Inside the PostgreSQL database query planner",
          ],
          correctIndex: 0,
          explanation: "Next.js Middleware runs at the Edge preceding request execution, enabling fast redirects and header modifications.",
        },
      ],
      content: "Deep-dive into Edge Middleware, token verification, and role-based access control.",
    },
    {
      id: "fs-l4",
      course_id: "course-fullstack-nextjs",
      title: "Performance Optimization, Streaming SSR & Edge Caching",
      order_index: 4,
      duration_minutes: 60,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Master Core Web Vitals, partial prerendering, image optimization, and global edge cache distributions.",
      learning_objectives: [
        "Optimize LCP, FID/INP, and CLS for 100/100 Lighthouse performance",
        "Implement Partial Prerendering (PPR) combining static shells with dynamic streaming",
        "Configure Cache-Control headers and stale-while-revalidate policies",
      ],
      theory_sections: [
        {
          heading: "1. Core Web Vitals Optimization",
          body: "Largest Contentful Paint (LCP) and Interaction to Next Paint (INP) govern real-world user perceived speed. Using next/image for modern AVIF/WebP encoding and prioritizing critical hero elements eliminates render-blocking delays.",
          key_points: [
            "Avoid massive client-side bundles by offloading data operations to Server Components.",
            "Use font optimization with next/font to prevent cumulative layout shifts (CLS).",
          ],
        },
      ],
      examples: [
        {
          title: "Dynamic Segment Configuration for Caching",
          language: "ts",
          code: `// app/api/benchmark/route.ts
export const dynamic = "force-dynamic"; // or "force-static"
export const revalidate = 300; // 5-minute CDN stale-while-revalidate

export async function GET() {
  const benchmarks = await db.assessment.findMany({ where: { is_published: true } });
  return Response.json(benchmarks, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}`,
          explanation: "Defines granular caching headers for CDN edge nodes.",
        },
      ],
      quiz: [
        {
          id: "fs-q7",
          question: "Which metric replaced First Input Delay (FID) as a Google Core Web Vital measuring responsiveness?",
          options: ["Interaction to Next Paint (INP)", "Cumulative Layout Shift (CLS)", "Time to First Byte (TTFB)", "Speed Index"],
          correctIndex: 0,
          explanation: "INP (Interaction to Next Paint) measures overall UI responsiveness across the lifetime of a user's page visit.",
        },
      ],
      content: "Complete architectural breakdown of Edge caching, Core Web Vitals, and Next.js performance tuning.",
    },
  ],

  // ==========================================
  // Track 2: Distributed Systems in Go
  // ==========================================
  "course-distributed-go": [
    {
      id: "go-l1",
      course_id: "course-distributed-go",
      title: "Concurrency Primitives: Goroutines, Channels & Worker Pools",
      order_index: 1,
      duration_minutes: 50,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Harness Go's CSP concurrency model. Learn Goroutine lifecycles, buffered channels, and production worker pools.",
      learning_objectives: [
        "Explain Communicating Sequential Processes (CSP) vs shared memory multithreading",
        "Implement a bounded worker pool that prevents memory exhaustion under high concurrency",
        "Properly utilize context.Context for cancellation, timeouts, and distributed deadlines",
      ],
      theory_sections: [
        {
          heading: "1. Goroutines vs OS Threads",
          body: "A Goroutine is a lightweight execution thread managed by the Go runtime scheduler (the M:N multiplexer). While an operating system thread typically allocates 1MB to 8MB of stack memory, a Goroutine begins with just 2KB of expandable stack memory.",
          key_points: [
            "A single Go backend service can comfortably run 100,000+ simultaneous Goroutines.",
            "Context switches occur in user space without expensive kernel-mode transitions.",
          ],
        },
        {
          heading: "2. Safe Communication via Channels & Worker Pools",
          body: "'Do not communicate by sharing memory; instead, share memory by communicating.' Worker pools restrict concurrency to a finite number of workers, ensuring database connection pools and CPU cores are not overwhelmed.",
          key_points: [
            "Unbuffered channels enforce synchronous synchronization between sender and receiver.",
            "Buffered channels decouple producer bursts from consumer throughput.",
            "Always close channels from the producer side to signal termination safely.",
          ],
        },
      ],
      examples: [
        {
          title: "Production Bounded Worker Pool in Go",
          language: "go",
          code: `package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

type Job struct {
	ID    int
	Input string
}

type Result struct {
	JobID  int
	Output string
	Err    error
}

func Worker(ctx context.Context, id int, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()
	for {
		select {
		case <-ctx.Done():
			return // Graceful cancellation
		case job, ok := <-jobs:
			if !ok {
				return // Channel closed, no more work
			}
			// Simulate compute processing
			res := Result{JobID: job.ID, Output: fmt.Sprintf("Processed by worker %d", id)}
			results <- res
		}
	}
}

func main() {
	const numWorkers = 4
	const numJobs = 20

	jobs := make(chan Job, numJobs)
	results := make(chan Result, numJobs)
	var wg sync.WaitGroup

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// Launch worker pool
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go Worker(ctx, w, jobs, results, &wg)
	}

	// Enqueue jobs
	for j := 1; j <= numJobs; j++ {
		jobs <- Job{ID: j, Input: fmt.Sprintf("Task payload %d", j)}
	}
	close(jobs)

	// Wait for workers to finish in separate goroutine
	go func() {
		wg.Wait()
		close(results)
	}()

	// Collect results
	for r := range results {
		fmt.Printf("Job %d completed: %s\\n", r.JobID, r.Output)
	}
}`,
          explanation: "This pattern limits maximum concurrency to 4 workers, receives jobs via buffered channels, and honors context timeouts.",
          output: "Job 1 completed: Processed by worker 1\nJob 2 completed: Processed by worker 2\n...",
        },
      ],
      quiz: [
        {
          id: "go-q1",
          question: "What is the initial stack allocation for a Go Goroutine?",
          options: ["Approximately 2KB", "1MB", "8MB", "512KB"],
          correctIndex: 0,
          explanation: "A Goroutine starts with only 2KB of dynamic stack space, allowing high numbers of concurrent routines without out-of-memory errors.",
        },
        {
          id: "go-q2",
          question: "Who should close a Go channel to avoid panics?",
          options: [
            "The sender/producer that writes to the channel",
            "The receiver that reads from the channel",
            "The garbage collector automatically at any time",
            "Any goroutine holding a pointer",
          ],
          correctIndex: 0,
          explanation: "Closing a channel from the receiver side can trigger a runtime panic if the sender attempts to write to a closed channel. The producer should always close it.",
        },
        {
          id: "go-q3",
          question: "How do you signal cancellation across deeply nested Goroutines in Go?",
          options: [
            "Pass a context.Context and listen to <-ctx.Done()",
            "Use a global boolean flag without mutexes",
            "Call os.Exit(0)",
            "Trigger a runtime panic",
          ],
          correctIndex: 0,
          explanation: "context.Context with ctx.Done() is the canonical, thread-safe mechanism to propagate cancellations, deadlines, and trace metadata.",
        },
      ],
      challenge: {
        prompt: "Build an in-memory Rate Limiter using a token bucket algorithm with a Go ticker and mutex synchronization.",
        starter_code: `package main

import "sync"

type RateLimiter struct {
	mu       sync.Mutex
	capacity int
	tokens   int
}

func (r *RateLimiter) Allow() bool {
	// Implement thread-safe token checking
	return false
}`,
        solution_code: `package main

import (
	"sync"
	"time"
)

type RateLimiter struct {
	mu       sync.Mutex
	capacity int
	tokens   int
	refill   time.Duration
}

func NewRateLimiter(capacity int, refill time.Duration) *RateLimiter {
	rl := &RateLimiter{capacity: capacity, tokens: capacity, refill: refill}
	go func() {
		ticker := time.NewTicker(refill)
		for range ticker.C {
			rl.mu.Lock()
			if rl.tokens < rl.capacity {
				rl.tokens++
			}
			rl.mu.Unlock()
		}
	}()
	return rl
}

func (r *RateLimiter) Allow() bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.tokens > 0 {
		r.tokens--
		return true
	}
	return false
}`,
        explanation: "Uses a background ticker goroutine to replenish tokens while protecting the token counter with a sync.Mutex.",
      },
      content: "Deep exploration of Go concurrency primitives, CSP, channel patterns, and worker pool architectures.",
    },
    {
      id: "go-l2",
      course_id: "course-distributed-go",
      title: "Building Resilient REST & gRPC Microservices",
      order_index: 2,
      duration_minutes: 55,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Design high-performance inter-service communication using Protocol Buffers and gRPC with bidirectional streaming.",
      learning_objectives: [
        "Define schema contracts using Protocol Buffers v3",
        "Implement unary, client streaming, and server streaming gRPC endpoints",
        "Add interceptors for authentication, logging, and distributed tracing",
      ],
      theory_sections: [
        {
          heading: "1. Protocol Buffers vs JSON",
          body: "Protocol Buffers serialize structured data into compact binary payloads, achieving 5x-10x throughput improvements over text-based JSON while guaranteeing backward and forward schema compatibility.",
          key_points: [
            "Eliminates parsing overhead by using field tag numbers rather than string field names.",
            "Generates type-safe client and server stubs automatically across multiple programming languages.",
          ],
        },
      ],
      examples: [
        {
          title: "Sample Protobuf Definition & Go Service Implementation",
          language: "protobuf",
          code: `syntax = "proto3";
package telemetry;
option go_package = "./pb";

message AssessmentSubmission {
  string student_id = 1;
  string assessment_id = 2;
  repeated int32 answers = 3;
}

message EvaluationResult {
  int32 score = 1;
  bool passed = 2;
  string feedback = 3;
}

service EvaluationEngine {
  rpc EvaluateBenchmark(AssessmentSubmission) returns (EvaluationResult);
}`,
          explanation: "Standard gRPC service contract defining strongly typed requests and responses.",
        },
      ],
      quiz: [
        {
          id: "go-q4",
          question: "Why is gRPC significantly faster than standard REST JSON over HTTP/1.1?",
          options: [
            "It runs over HTTP/2 with multiplexing and uses binary Protocol Buffer serialization",
            "It does not use TCP networking",
            "It only works on localhost",
            "It disables all security checks",
          ],
          correctIndex: 0,
          explanation: "gRPC leverages HTTP/2 multiplexing (multiple concurrent requests over a single TCP connection) combined with compact binary serialization.",
        },
      ],
      content: "Complete guide to gRPC, Protocol Buffers, interceptors, and high-throughput microservice design.",
    },
    {
      id: "go-l3",
      course_id: "course-distributed-go",
      title: "Distributed Caching, Redis Locking & Cache Stampede Mitigation",
      order_index: 3,
      duration_minutes: 50,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Master distributed caching patterns: Cache-Aside, Write-Through, Redis distributed mutexes (Redlock), and probabilistic early expiration.",
      learning_objectives: [
        "Implement Cache-Aside pattern with resilient fallback to primary PostgreSQL",
        "Prevent Cache Stampedes / Thundering Herd using singleflight.Group",
        "Implement distributed locks with TTL safeguards in Redis",
      ],
      theory_sections: [
        {
          heading: "1. The Cache Stampede Problem",
          body: "When a popular cache key expires under high traffic (e.g. 10,000 requests/sec), all concurrent requests miss the cache simultaneously and query the database at once, causing cascading failure. Using Go's golang.org/x/sync/singleflight coalesces duplicate requests into a single database execution.",
          key_points: [
            "singleflight ensures only one in-flight query executes while other requests wait for the result.",
            "Drastically reduces database CPU utilization during traffic spikes.",
          ],
        },
      ],
      examples: [
        {
          title: "Eliminating Cache Stampedes with singleflight.Group",
          language: "go",
          code: `package main

import (
	"golang.org/x/sync/singleflight"
	"time"
)

var sfGroup singleflight.Group

func GetCourseDetails(courseID string) (string, error) {
	// 1. Try Redis cache
	if cached, ok := cacheGet(courseID); ok {
		return cached, nil
	}

	// 2. Coalesce concurrent database hits using singleflight
	v, err, _ := sfGroup.Do(courseID, func() (interface{}, error) {
		// Only 1 goroutine executes this DB call; all other 9999 wait for result
		data, err := queryPostgres(courseID)
		if err == nil {
			cacheSet(courseID, data, 10*time.Minute)
		}
		return data, err
	})

	if err != nil {
		return "", err
	}
	return v.(string), nil
}`,
          explanation: "singleflight.Do ensures that identical keys in-flight only trigger a single database operation.",
        },
      ],
      quiz: [
        {
          id: "go-q5",
          question: "What does Go's singleflight.Group accomplish in a distributed caching architecture?",
          options: [
            "Suppresses duplicate concurrent calls for the same key, sharing the result with all callers",
            "Compresses Redis memory by 50%",
            "Encrypts database passwords in memory",
            "Replaces PostgreSQL with SQLite",
          ],
          correctIndex: 0,
          explanation: "singleflight prevents cache stampedes by merging duplicate in-flight requests so only one call hits the database.",
        },
      ],
      content: "In-depth guide to distributed caching, Redis concurrency, and cache stampede prevention.",
    },
    {
      id: "go-l4",
      course_id: "course-distributed-go",
      title: "Event-Driven Systems with Kafka & Idempotent Consumer Patterns",
      order_index: 4,
      duration_minutes: 60,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Engineer decoupled architectures with Apache Kafka, consumer groups, partition rebalances, and transactional outbox patterns.",
      learning_objectives: [
        "Design idempotent event consumers with deduplication keys",
        "Implement the Transactional Outbox pattern to guarantee at-least-once message delivery",
        "Handle poison pill messages with Dead Letter Queues (DLQ)",
      ],
      theory_sections: [
        {
          heading: "1. The Transactional Outbox Pattern",
          body: "Directly writing to both a database and a message queue in the same request risks inconsistency if one fails. The Transactional Outbox pattern writes events into an outbox table within the same ACID database transaction, then an asynchronous worker publishes them to Kafka.",
          key_points: [
            "Guarantees that database updates and published events never drift out of sync.",
            "Consumers must be designed with idempotency keys because network retries can deliver messages more than once.",
          ],
        },
      ],
      examples: [
        {
          title: "Idempotent Event Consumer Logic",
          language: "go",
          code: `func ProcessOrderEvent(db *sql.DB, event Event) error {
	// Check if already processed (deduplication)
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM processed_events WHERE id = $1)", event.ID).Scan(&exists)
	if exists {
		log.Printf("Duplicate event %s detected, skipping", event.ID)
		return nil // ACK message
	}

	// Process within transaction
	tx, _ := db.Begin()
	defer tx.Rollback()

	_, err = tx.Exec("UPDATE accounts SET balance = balance + $1 WHERE user_id = $2", event.Amount, event.UserID)
	if err != nil { return err }

	_, err = tx.Exec("INSERT INTO processed_events (id, processed_at) VALUES ($1, NOW())", event.ID)
	if err != nil { return err }

	return tx.Commit()
}`,
          explanation: "Guarantees exact-once processing semantics through deduplication tracking.",
        },
      ],
      quiz: [
        {
          id: "go-q6",
          question: "Why must message consumers in distributed event queues like Kafka be designed to be idempotent?",
          options: [
            "Because distributed networks can duplicate messages during retries (at-least-once delivery)",
            "Because Kafka automatically deletes unread events after 1 second",
            "Because Go requires all functions to have no return values",
            "Because JSON serialization changes event IDs randomly",
          ],
          correctIndex: 0,
          explanation: "Distributed queues provide at-least-once delivery. Network timeouts during consumer acknowledgments cause brokers to redeliver the event.",
        },
      ],
      content: "Architectural blueprint for event-driven systems, message queues, and outbox patterns.",
    },
  ],

  // ==========================================
  // Track 3: AI & LLM Systems
  // ==========================================
  "course-ai-llm-systems": [
    {
      id: "ai-l1",
      course_id: "course-ai-llm-systems",
      title: "LLM Fundamentals, Structured Outputs & System Prompts",
      order_index: 1,
      duration_minutes: 45,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Master LLM inference parameters, system persona engineering, and strict JSON Schema output enforcement.",
      learning_objectives: [
        "Explain tokenization, context windows, temperature, and top-p sampling",
        "Enforce strict JSON schema responses using Gemini Structured Outputs",
        "Craft defensible system prompts resilient against prompt injection attacks",
      ],
      theory_sections: [
        {
          heading: "1. Autoregressive Generation & Sampling Parameters",
          body: "Large Language Models predict probability distributions over tokens. Temperature controls randomness: 0.0 forces greedy decoding (deterministic), ideal for code generation and schema output, while 0.7-1.0 increases creative variance.",
          key_points: [
            "Temperature: Lower values (0.0 - 0.2) ensure deterministic, mathematically rigorous outputs.",
            "Top-P (Nucleus Sampling): Limits token choices to the top cumulative probability mass.",
          ],
        },
        {
          heading: "2. Structured Outputs vs Loose Prompting",
          body: "Instead of asking the LLM to 'please output valid JSON', modern production APIs (such as Google Gemini) accept a strict JSON Schema, constraining the model's token vocabulary logits during generation so that invalid JSON is mathematically impossible.",
          key_points: [
            "Guarantees 100% parseable JSON without regex or retry hacks.",
            "Integrates seamlessly with TypeScript types and Zod schemas.",
          ],
        },
      ],
      examples: [
        {
          title: "Gemini API with Strict JSON Schema Enforcement",
          language: "typescript",
          code: `import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function evaluateCodeSnippet(code: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: \`Evaluate the following code snippet for security flaws:\\n\${code}\`,
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER, description: "Score from 0 to 100" },
          vulnerabilities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          remediation: { type: Type.STRING },
        },
        required: ["score", "vulnerabilities", "remediation"],
      },
    },
  });

  // Guarantees valid JSON conforming to the schema
  const data = JSON.parse(response.text);
  return data;
}`,
          explanation: "responseSchema constrains the decoder logits, guaranteeing syntactically valid JSON matching your schema.",
          output: `{\n  "score": 85,\n  "vulnerabilities": ["Unescaped SQL query in line 12"],\n  "remediation": "Use parameterized queries"\n}`,
        },
      ],
      quiz: [
        {
          id: "ai-q1",
          question: "What temperature setting is recommended when extracting strict structured data or evaluating code?",
          options: ["0.0 to 0.2", "1.5 to 2.0", "0.95", "-1.0"],
          correctIndex: 0,
          explanation: "A low temperature (0.0 to 0.2) minimizes sampling entropy, resulting in deterministic and consistent structured outputs.",
        },
        {
          id: "ai-q2",
          question: "What is the primary benefit of native JSON Schema enforcement (Structured Outputs) in modern LLMs?",
          options: [
            "The model constrains token logits to guarantee 100% schema-compliant output without parsing errors",
            "It speeds up internet connection bandwidth",
            "It allows the model to access files on your local desktop",
            "It completely removes the token context limit",
          ],
          correctIndex: 0,
          explanation: "Structured Outputs restrict the model's vocabulary during generation, making schema violations mathematically impossible.",
        },
      ],
      challenge: {
        prompt: "Design a schema and system prompt that parses unstructured user resume text into normalized JSON containing name, skills, and work experience.",
        starter_code: `// Define Zod schema and system instruction for resume parsing
import { z } from "zod";

export const ResumeSchema = z.object({
  // Add fields
});`,
        solution_code: `import { z } from "zod";

export const ResumeSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  skills: z.array(z.string()),
  yearsOfExperience: z.number().nonnegative(),
  roles: z.array(z.object({
    company: z.string(),
    title: z.string(),
    highlights: z.array(z.string())
  }))
});`,
        explanation: "A normalized schema guarantees type-safety across backend pipelines and database persistence.",
      },
      content: "Foundational concepts in LLM inference, temperature tuning, and schema-constrained generation.",
    },
    {
      id: "ai-l2",
      course_id: "course-ai-llm-systems",
      title: "Vector Embeddings, Hybrid Search & Enterprise RAG Pipelines",
      order_index: 2,
      duration_minutes: 55,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Build production Retrieval Augmented Generation (RAG). Learn chunking strategies, pgvector, and hybrid BM25 search.",
      learning_objectives: [
        "Transform unstructured technical documentation into semantic vector embeddings",
        "Implement pgvector cosine distance queries in PostgreSQL",
        "Combine keyword search (BM25) with vector search using Reciprocal Rank Fusion (RRF)",
      ],
      theory_sections: [
        {
          heading: "1. The Vector Embedding Space",
          body: "Embeddings map text chunks into high-dimensional geometric vectors (e.g. 768 or 1536 dimensions). Texts with similar semantic meanings have a smaller angular distance (higher cosine similarity), regardless of exact keyword overlap.",
          key_points: [
            "Captures synonyms, concepts, and contextual intent that traditional SQL LIKE queries miss.",
            "Chunk size trade-off: Small chunks (256 tokens) provide specific context; large chunks (1024 tokens) preserve holistic narrative.",
          ],
        },
      ],
      examples: [
        {
          title: "Hybrid Search with PostgreSQL pgvector",
          language: "sql",
          code: `-- PostgreSQL pgvector similarity query
SELECT 
  id, 
  title, 
  content,
  1 - (embedding <=> $1) AS cosine_similarity
FROM course_lessons
WHERE 1 - (embedding <=> $1) > 0.78
ORDER BY cosine_similarity DESC
LIMIT 5;`,
          explanation: "The <=> operator calculates cosine distance between the user query embedding and indexed document embeddings.",
        },
      ],
      quiz: [
        {
          id: "ai-q3",
          question: "What operator in PostgreSQL pgvector computes cosine distance?",
          options: ["<=>", "<->", "LIKE", "@@"],
          correctIndex: 0,
          explanation: "<=> calculates cosine distance, whereas <-> calculates Euclidean distance (L2) and <#> calculates negative inner product.",
        },
      ],
      content: "Complete engineering roadmap for Enterprise RAG, vector indexes, chunking, and semantic retrieval.",
    },
    {
      id: "ai-l3",
      course_id: "course-ai-llm-systems",
      title: "Autonomous Tool-Calling Agents & Multi-Step ReAct Loops",
      order_index: 3,
      duration_minutes: 60,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Construct autonomous agents that reason, call external APIs, evaluate tool results, and iterate to achieve complex goals.",
      learning_objectives: [
        "Implement the ReAct (Reasoning + Acting) loop pattern",
        "Provide declarative tools with schemas for database queries, code execution, and web lookups",
        "Prevent infinite agent loops with step limits and validation guardrails",
      ],
      theory_sections: [
        {
          heading: "1. The ReAct Architecture",
          body: "Instead of a single generation pass, an agent evaluates: Thought -> Action (Tool Call) -> Observation (Tool Output) -> Reflection. This loop repeats until the agent determines the final answer has been found.",
          key_points: [
            "Allows LLMs to interact with live databases, run test runners, and fetch external telemetry.",
            "Crucial to enforce step limits (e.g. max 10 iterations) and timeout budgets to prevent runaway costs.",
          ],
        },
      ],
      examples: [
        {
          title: "Agent Tool-Calling Loop Definition",
          language: "typescript",
          code: `const tools = [
  {
    name: "runTestRunner",
    description: "Executes unit test suite for candidate code",
    parameters: {
      type: "object",
      properties: { testFile: { type: "string" } },
      required: ["testFile"]
    }
  }
];

// Agent inspects goal, calls tool, receives result, and formulates response.`,
          explanation: "Declaring tools allows the model to emit tool call requests which the host environment executes.",
        },
      ],
      quiz: [
        {
          id: "ai-q4",
          question: "What does the ReAct framework stand for in autonomous AI agent architecture?",
          options: [
            "Reasoning + Acting",
            "React.js UI Framework",
            "Reactive Stream Protocol",
            "Recursive Action Tree",
          ],
          correctIndex: 0,
          explanation: "ReAct stands for Reasoning and Acting: intertwining thoughts with tool execution.",
        },
      ],
      content: "Building autonomous agents, multi-agent swarms, tool dispatchers, and stateful memory.",
    },
    {
      id: "ai-l4",
      course_id: "course-ai-llm-systems",
      title: "Production Guardrails, Evaluation Frameworks & Latency Optimization",
      order_index: 4,
      duration_minutes: 50,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Deploy LLM applications safely. Master automated evals, semantic caching, prompt injection shields, and streaming TTFT reduction.",
      learning_objectives: [
        "Implement automated LLM-as-a-judge evaluation pipelines",
        "Set up prompt injection filters and toxicity guardrails",
        "Reduce Time-to-First-Token (TTFT) through speculative decoding and streaming",
      ],
      theory_sections: [
        {
          heading: "1. LLM Evaluation & CI/CD Benchmarking",
          body: "Unit testing for probabilistic systems requires automated evaluation benchmarks (evals). Comparing candidate prompt revisions against golden datasets ensures changes do not regress accuracy or safety.",
          key_points: [
            "Use LLM-as-a-judge with structured scoring rubrics for qualitative assessments.",
            "Track metrics: Hallucination rate, Faithfulness to retrieved context, and Answer relevance.",
          ],
        },
      ],
      examples: [
        {
          title: "Automated Faithfulness Eval Function",
          language: "typescript",
          code: `async function evalFaithfulness(context: string, answer: string): Promise<number> {
  const prompt = \`Given this context:\\n\${context}\\n\\nDoes the answer contain unsupported claims?\\nAnswer:\\n\${answer}\\nOutput score between 0.0 and 1.0.\`;
  // Call evaluator model
  return 0.95;
}`,
          explanation: "Measures whether the generation is fully grounded in the provided factual context.",
        },
      ],
      quiz: [
        {
          id: "ai-q5",
          question: "What is TTFT in LLM serving performance benchmarks?",
          options: [
            "Time to First Token: latency until the initial token is received by the client",
            "Total Token Format Test",
            "Thread Transfer Frequency Threshold",
            "Temperature Tuning Final Target",
          ],
          correctIndex: 0,
          explanation: "Time to First Token (TTFT) measures how quickly an LLM begins streaming text back to the user.",
        },
      ],
      content: "Production deployment patterns, automated evals, guardrails, and latency optimization.",
    },
  ],

  // ==========================================
  // Track 4: Cloud & DevOps SRE
  // ==========================================
  "course-cloud-devops": [
    {
      id: "ops-l1",
      course_id: "course-cloud-devops",
      title: "Multi-Stage Docker Builds & Minimal Container Security",
      order_index: 1,
      duration_minutes: 45,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Create minimal, hardened Docker images using multi-stage builds, non-root users, and CVE vulnerability scanning.",
      learning_objectives: [
        "Dramatically shrink image size from 1.2GB to under 25MB using Alpine and Scratch",
        "Implement non-root security principles to mitigate container breakout attacks",
        "Optimize Docker layer caching for sub-10s CI build cycles",
      ],
      theory_sections: [
        {
          heading: "1. The Principle of Minimal Attack Surface",
          body: "Production containers should never include compilers, shell interpreters, package managers, or debug tools. Multi-stage builds compile code in a builder stage and copy only the compiled binary into an empty (scratch) or minimal (distroless) production container.",
          key_points: [
            "Shrinks container size by 95%+, accelerating cluster pull times during scaling events.",
            "Eliminates vulnerable binaries like curl, apt, and bash that attackers exploit.",
          ],
        },
      ],
      examples: [
        {
          title: "Hardened Production Multi-Stage Dockerfile for Go / Next.js",
          language: "dockerfile",
          code: `# Stage 1: Build binary
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server .

# Stage 2: Minimal Distroless Runtime
FROM gcr.io/distroless/static-debian12:nonroot
USER nonroot:nonroot
WORKDIR /
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]`,
          explanation: "Produces a 15MB binary image running as an unprivileged user without shell access.",
        },
      ],
      quiz: [
        {
          id: "ops-q1",
          question: "What is the primary security advantage of using distroless container images in production?",
          options: [
            "They contain no shell, package manager, or extraneous binaries, minimizing the attack surface",
            "They allow root access by default without a password",
            "They make the container immune to internet disconnection",
            "They double the CPU clock speed of the host",
          ],
          correctIndex: 0,
          explanation: "Distroless images strip everything except the application runtime, preventing malicious shell execution.",
        },
      ],
      challenge: {
        prompt: "Fix a vulnerable Dockerfile that runs as root and carries build tools into the final runtime image.",
        starter_code: `FROM node:20
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "index.js"]`,
        solution_code: `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

FROM node:20-alpine
USER node
WORKDIR /app
COPY --from=build --chown=node:node /app /app
CMD ["node", "index.js"]`,
        explanation: "Separating build stages and running as non-root 'node' user secures the deployment.",
      },
      content: "Complete guide to Docker multi-stage builds, layer caching, and container hardening.",
    },
    {
      id: "ops-l2",
      course_id: "course-cloud-devops",
      title: "Kubernetes Core Architecture: Pods, Services, Deployments & Ingress",
      order_index: 2,
      duration_minutes: 60,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Deploy resilient applications on Kubernetes. Master declarative manifests, rolling update strategies, and liveness/readiness probes.",
      learning_objectives: [
        "Differentiate between Pods, ReplicaSets, Deployments, and Services",
        "Configure liveness and readiness probes to prevent traffic routing to booting pods",
        "Set resource requests and limits to prevent out-of-memory (OOM) node evictions",
      ],
      theory_sections: [
        {
          heading: "1. Declarative Reconciliation Loop",
          body: "Kubernetes maintains desired state continuously through reconciliation controllers. If a node fails or a pod crashes, the controller manager notices the difference between desired replicas and actual running pods and automatically reschedules replacements.",
          key_points: [
            "Readiness probes determine when a pod is ready to accept HTTP traffic from the Service.",
            "Liveness probes restart pods that have entered deadlock states.",
          ],
        },
      ],
      examples: [
        {
          title: "Kubernetes Deployment Manifest with Health Probes",
          language: "yaml",
          code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: unlocked-backend
  labels:
    app: unlocked-api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: unlocked-api
  template:
    metadata:
      labels:
        app: unlocked-api
    spec:
      containers:
      - name: api
        image: ghcr.io/unlocked/api:v1.2.0
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10`,
          explanation: "Guarantees zero downtime by keeping maxUnavailable at 0 during rolling updates.",
        },
      ],
      quiz: [
        {
          id: "ops-q2",
          question: "What happens when a pod fails its Kubernetes readiness probe?",
          options: [
            "It is removed from the Service endpoints so no traffic is routed to it, but it is NOT restarted",
            "The node is rebooted instantly",
            "The cluster deletes all deployments",
            "The pod is killed and rescheduled",
          ],
          correctIndex: 0,
          explanation: "Readiness probe failures stop traffic routing to the pod. Liveness probe failures, on the other hand, trigger a pod restart.",
        },
      ],
      content: "Complete operational walkthrough of Kubernetes clusters, deployments, services, and ingress.",
    },
    {
      id: "ops-l3",
      course_id: "course-cloud-devops",
      title: "GitOps Pipelines with Automated Blue/Green & Canary Rollouts",
      order_index: 3,
      duration_minutes: 50,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Automate delivery with ArgoCD or GitHub Actions using Canary releases, automated rollbacks, and policy validation.",
      learning_objectives: [
        "Implement GitOps where Git is the single source of truth for cluster state",
        "Configure Canary deployments routing 10% of traffic to new releases before full promotion",
        "Automate instant rollback on Prometheus error-budget violations",
      ],
      theory_sections: [
        {
          heading: "1. The GitOps Model",
          body: "In GitOps, developers never manually run kubectl commands against production. Instead, pull requests update manifest repositories, and agents inside the cluster pull and synchronize state automatically.",
          key_points: [
            "Provides an auditable git history for every infrastructure and application change.",
            "Eliminates local credential management and unauthorized manual drift.",
          ],
        },
      ],
      examples: [
        {
          title: "GitHub Actions CI/CD Pipeline Step",
          language: "yaml",
          code: `name: Build and Push Image
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Container
        run: docker build -t ghcr.io/unlocked/app:\${{ github.sha }} .
      - name: Push Container
        run: docker push ghcr.io/unlocked/app:\${{ github.sha }}`,
          explanation: "Automated continuous delivery pipeline building immutable image tags.",
        },
      ],
      quiz: [
        {
          id: "ops-q3",
          question: "What is the primary characteristic of GitOps?",
          options: [
            "Git is the single source of truth, and automated agents synchronize cluster state to match Git",
            "Developers must SSH into production servers to apply hotfixes",
            "All code must be written in Git bash",
            "Databases are replaced by Git commits",
          ],
          correctIndex: 0,
          explanation: "GitOps uses Git repositories as the declarative source of truth for deployments and infrastructure.",
        },
      ],
      content: "Deep exploration of GitOps, continuous deployment, and canary testing.",
    },
    {
      id: "ops-l4",
      course_id: "course-cloud-devops",
      title: "Observability Stack: Prometheus, Grafana & High-Impact SRE Triage",
      order_index: 4,
      duration_minutes: 55,
      video_url: null,
      is_published: true,
      created_at: "2024-11-20T00:00:00.000Z",
      updated_at: "2024-11-20T00:00:00.000Z",
      summary: "Master the 4 Golden Signals (Latency, Traffic, Errors, Saturation). Set up Prometheus metrics, Grafana dashboards, and SLO alert routing.",
      learning_objectives: [
        "Instrument backend microservices with Prometheus counters and histograms",
        "Define Service Level Objectives (SLOs) and calculate Error Budget burn rates",
        "Perform systematic root-cause analysis during live outages without panic",
      ],
      theory_sections: [
        {
          heading: "1. The Four Golden Signals of SRE",
          body: "Google's SRE framework prioritizes four vital health metrics: Latency (time to serve a request), Traffic (demand/throughput), Errors (rate of failed requests), and Saturation (fraction of system resources utilized).",
          key_points: [
            "Alert on symptom breaches (high error rate, user-facing latency) rather than causes (high CPU).",
            "Error budgets define how much unreliability is acceptable within an SLA period.",
          ],
        },
      ],
      examples: [
        {
          title: "PromQL Latency Histogram Query",
          language: "promql",
          code: `# Calculate p99 latency over 5-minute rolling window
histogram_quantile(
  0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)`,
          explanation: "Calculates the 99th percentile response time across all cluster pods.",
        },
      ],
      quiz: [
        {
          id: "ops-q4",
          question: "Which of the following are the Google SRE Four Golden Signals?",
          options: [
            "Latency, Traffic, Errors, and Saturation",
            "CPU, RAM, Disk, and Network",
            "Docker, Kubernetes, Linux, and Cloud",
            "Speed, Power, Memory, and Storage",
          ],
          correctIndex: 0,
          explanation: "Latency, Traffic, Errors, and Saturation are the four golden signals of monitoring.",
        },
      ],
      content: "Complete guide to Prometheus instrumentation, Grafana visualization, and SRE incident response.",
    },
  ],
};
