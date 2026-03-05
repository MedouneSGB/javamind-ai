import type { LearningPath } from '../types/learning.types'

export const CURRICULUM: LearningPath = {
  tracks: [
    {
      id: 'fundamentals',
      title: 'Java Fundamentals',
      description: 'The building blocks of Java programming',
      concepts: [
        {
          id: 'setup',
          title: 'Hello World & Setup',
          description: 'Your first Java program and understanding the JVM',
          prerequisite: [],
          track: 'fundamentals',
        },
        {
          id: 'variables',
          title: 'Variables & Data Types',
          description: 'int, String, boolean, double and more',
          prerequisite: ['setup'],
          track: 'fundamentals',
        },
        {
          id: 'operators',
          title: 'Operators & Expressions',
          description: 'Arithmetic, comparison, and logical operators',
          prerequisite: ['variables'],
          track: 'fundamentals',
        },
        {
          id: 'control-flow',
          title: 'Control Flow',
          description: 'if/else, switch, ternary operator',
          prerequisite: ['operators'],
          track: 'fundamentals',
        },
        {
          id: 'loops',
          title: 'Loops & Iteration',
          description: 'for, while, do-while, for-each',
          prerequisite: ['control-flow'],
          track: 'fundamentals',
        },
        {
          id: 'methods',
          title: 'Methods & Functions',
          description: 'Parameters, return types, method overloading',
          prerequisite: ['loops'],
          track: 'fundamentals',
        },
        {
          id: 'arrays',
          title: 'Arrays',
          description: 'Single and multi-dimensional arrays',
          prerequisite: ['methods'],
          track: 'fundamentals',
        },
        {
          id: 'strings',
          title: 'Strings & String Methods',
          description: 'String manipulation, StringBuilder, common methods',
          prerequisite: ['arrays'],
          track: 'fundamentals',
        },
      ],
    },
    {
      id: 'oop',
      title: 'Object-Oriented Programming',
      description: 'The heart of Java — classes, objects, and design',
      concepts: [
        {
          id: 'classes',
          title: 'Classes & Objects',
          description: 'Creating classes, constructors, instance variables',
          prerequisite: ['methods'],
          track: 'oop',
        },
        {
          id: 'encapsulation',
          title: 'Encapsulation',
          description: 'Access modifiers, getters, setters, data hiding',
          prerequisite: ['classes'],
          track: 'oop',
        },
        {
          id: 'inheritance',
          title: 'Inheritance',
          description: 'extends, super, method overriding, IS-A relationship',
          prerequisite: ['encapsulation'],
          track: 'oop',
        },
        {
          id: 'polymorphism',
          title: 'Polymorphism',
          description: 'Runtime polymorphism, upcasting, dynamic dispatch',
          prerequisite: ['inheritance'],
          track: 'oop',
        },
        {
          id: 'interfaces',
          title: 'Interfaces & Abstract Classes',
          description: 'interface, abstract class, default methods',
          prerequisite: ['polymorphism'],
          track: 'oop',
        },
        {
          id: 'collections',
          title: 'Collections Framework',
          description: 'ArrayList, HashMap, Set, Queue, LinkedList',
          prerequisite: ['interfaces'],
          track: 'oop',
        },
        {
          id: 'exceptions',
          title: 'Exception Handling',
          description: 'try/catch/finally, custom exceptions, checked vs unchecked',
          prerequisite: ['classes'],
          track: 'oop',
        },
      ],
    },
    {
      id: 'advanced',
      title: 'Advanced Java',
      description: 'Modern Java features and professional patterns',
      concepts: [
        {
          id: 'generics',
          title: 'Generics',
          description: 'Type parameters, bounded wildcards, generic methods',
          prerequisite: ['collections'],
          track: 'advanced',
        },
        {
          id: 'lambdas',
          title: 'Lambdas & Functional Interfaces',
          description: 'Lambda expressions, Function, Predicate, Consumer',
          prerequisite: ['interfaces'],
          track: 'advanced',
        },
        {
          id: 'streams',
          title: 'Streams API',
          description: 'map, filter, reduce, collect, parallel streams',
          prerequisite: ['lambdas'],
          track: 'advanced',
        },
        {
          id: 'optional',
          title: 'Optional & Null Safety',
          description: 'Optional class, avoiding NullPointerException',
          prerequisite: ['generics'],
          track: 'advanced',
        },
        {
          id: 'concurrency',
          title: 'Concurrency & Threads',
          description: 'Thread, Runnable, synchronized, ExecutorService',
          prerequisite: ['streams'],
          track: 'advanced',
        },
        {
          id: 'design-patterns',
          title: 'Design Patterns',
          description: 'Singleton, Factory, Observer, Strategy, Builder',
          prerequisite: ['interfaces', 'generics'],
          track: 'advanced',
        },
        {
          id: 'io',
          title: 'File I/O',
          description: 'Files, Path, BufferedReader, NIO2',
          prerequisite: ['exceptions'],
          track: 'advanced',
        },
      ],
    },
  ],
}

export function getConceptById(conceptId: string) {
  for (const track of CURRICULUM.tracks) {
    const concept = track.concepts.find(c => c.id === conceptId)
    if (concept) return concept
  }
  return null
}

export function getAvailableConcepts(masteredIds: string[]): string[] {
  const available: string[] = []
  for (const track of CURRICULUM.tracks) {
    for (const concept of track.concepts) {
      if (masteredIds.includes(concept.id)) continue
      const prereqsMet = concept.prerequisite.every(p => masteredIds.includes(p))
      if (prereqsMet) available.push(concept.id)
    }
  }
  return available
}
