import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TechTopic from "@/models/TechTopic";

const DEFAULT_TOPICS = [
  {
    title: "SOLID Principles",
    category: "Architecture",
    tagline: "Five foundational OOP design principles for clean Dart code.",
    description:
      "Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion — applied to Flutter, these guide you to write focused, extensible, and testable code.",
    url: "https://dart.dev/effective-dart/design",
  },
  {
    title: "Clean Architecture",
    category: "Architecture",
    tagline: "Layered architecture separating Flutter apps into independent, testable layers.",
    description:
      "Divides your app into data, domain, and presentation layers where inner layers have no knowledge of outer layers. Makes the codebase highly testable and maintainable as features grow.",
    url: "https://resocoder.com/flutter-clean-architecture-tdd/",
  },
  {
    title: "Design Patterns in Dart",
    category: "Architecture",
    tagline: "Classic GoF patterns — Factory, Singleton, Observer, Strategy — in idiomatic Dart.",
    description:
      "Proven, reusable solutions to common design problems. Singleton for services, Factory for widget creation, Observer via Streams, and Strategy for swappable algorithms appear frequently in Flutter.",
    url: "https://refactoring.guru/design-patterns",
  },
  {
    title: "Riverpod",
    category: "State Management",
    tagline: "Reactive caching and data-binding that makes async code a breeze.",
    description:
      "A compile-safe, testable state management solution that doesn't depend on the widget tree. Natively handles loading/error states, supports pull-to-refresh, and cleanly separates business logic from UI.",
    url: "https://riverpod.dev",
  },
  {
    title: "Shorebird",
    category: "CI/CD",
    tagline: "Over-the-air code push — deploy Flutter fixes without app store review.",
    description:
      "Push code updates directly to users' devices, bypassing the app store review cycle. Critical bug fixes reach users in minutes rather than days. Also provides CI tailored for Flutter.",
    url: "https://shorebird.dev",
  },
  {
    title: "Fastlane",
    category: "CI/CD",
    tagline: "Automate building, testing, and releasing iOS & Android apps.",
    description:
      "Handles code signing, screenshot generation, beta distribution, and store submissions via simple config files. The most widely adopted CI/CD automation tool in mobile development.",
    url: "https://fastlane.tools",
  },
  {
    title: "Flutter DevTools",
    category: "Tool",
    tagline: "Official debugging and performance profiling suite for Flutter.",
    description:
      "Browser-based suite with widget inspector, timeline view, memory/CPU profiler, and network profiler. Essential for diagnosing UI jank, memory leaks, and performance bottlenecks.",
    url: "https://docs.flutter.dev/tools/devtools",
  },
  {
    title: "Mason CLI",
    category: "Tool",
    tagline: "Create and consume reusable code templates (bricks) for Dart projects.",
    description:
      "Generate features, models, and tests from parameterized templates using Mustache. Share bricks via BrickHub for team-wide standardization of code structure and patterns.",
    url: "https://pub.dev/packages/mason_cli",
  },
  {
    title: "Very Good CLI",
    category: "Tool",
    tagline: "Opinionated Flutter project scaffolding with built-in best practices.",
    description:
      "Generates production-ready projects with 100% test coverage templates, flavoring support, CI/CD workflows, and clean layered architecture. Created by Very Good Ventures.",
    url: "https://cli.vgv.dev",
  },
  {
    title: "Dart Frog",
    category: "Backend",
    tagline: "Fast, minimalistic backend framework — build APIs in Dart.",
    description:
      "Express-like routing for Dart with file-system-based routes, middleware, dependency injection, and hot reload. Share models and types across Flutter frontend and Dart backend.",
    url: "https://dartfrog.vgv.dev",
  },
  {
    title: "Serverpod",
    category: "Backend",
    tagline: "Full-stack Dart server with ORM, auth, real-time, and auto-generated clients.",
    description:
      "A complete backend solution with ORM, serialization, authentication, caching, and file storage. Auto-generates client code for end-to-end type safety between Flutter and server.",
    url: "https://serverpod.dev",
  },
  {
    title: "Patrol",
    category: "Testing",
    tagline: "E2E UI testing that handles native interactions like permissions and notifications.",
    description:
      "Overcomes integration_test limitations by enabling interaction with native OS features. Supports Android, iOS, macOS, and web with a concise custom finder API.",
    url: "https://patrol.leancode.co",
  },
];

export async function GET() {
  try {
    await connectDB();

    let topics = await TechTopic.find().sort({ createdAt: 1 }).lean();

    if (topics.length === 0) {
      await TechTopic.insertMany(DEFAULT_TOPICS);
      topics = await TechTopic.find().sort({ createdAt: 1 }).lean();
    }

    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, category, tagline, description, url } = await req.json();

    if (!title || !category || !tagline || !description || !url) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const topic = await TechTopic.create({ title, category, tagline, description, url });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
