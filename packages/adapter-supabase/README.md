# @relyo/adapter-supabase

Read-only Supabase Management API adapter for Relyo launch proof.

It observes only normalized project health, Auth redirect/config metadata, backup metadata, and RLS/policy metadata through Supabase's dedicated read-only SQL endpoint. It never requests API key values, database passwords, service-role keys, application rows, or arbitrary SQL.

Inaccessible optional facts remain unavailable so downstream contracts can return `UNKNOWN` rather than inferring `PASS`.
