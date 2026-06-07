/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        CHAT_LIMITS: any; // Cloudflare KV Namespace
        AI: any;          // Cloudflare Workers AI Binding
      };
    };
  }
}
