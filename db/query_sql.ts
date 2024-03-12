import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getAuthorQuery = `-- name: GetAuthor :one
SELECT id, name, bio FROM authors
WHERE id = $1 LIMIT 1`;

export interface GetAuthorArgs {
    id: string;
}

export interface GetAuthorRow {
    id: string;
    name: string;
    bio: string | null;
}

export async function getAuthor(client: Client, args: GetAuthorArgs): Promise<GetAuthorRow | null> {
    const result = await client.query({
        text: getAuthorQuery,
        values: [args.id],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        name: row[1],
        bio: row[2]
    };
}

export const listAuthorsQuery = `-- name: ListAuthors :many
SELECT id, name, bio FROM authors
ORDER BY name`;

export interface ListAuthorsRow {
    id: string;
    name: string;
    bio: string | null;
}

export async function listAuthors(client: Client): Promise<ListAuthorsRow[]> {
    const result = await client.query({
        text: listAuthorsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            id: row[0],
            name: row[1],
            bio: row[2]
        };
    });
}

export const createAuthorQuery = `-- name: CreateAuthor :one
INSERT INTO authors (
  name, bio
) VALUES (
  $1, $2
)
RETURNING id, name, bio`;

export interface CreateAuthorArgs {
    name: string;
    bio: string | null;
}

export interface CreateAuthorRow {
    id: string;
    name: string;
    bio: string | null;
}

export async function createAuthor(client: Client, args: CreateAuthorArgs): Promise<CreateAuthorRow | null> {
    const result = await client.query({
        text: createAuthorQuery,
        values: [args.name, args.bio],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        name: row[1],
        bio: row[2]
    };
}

export const updateAuthorQuery = `-- name: UpdateAuthor :one
UPDATE authors
  set name = $2,
  bio = $3
WHERE id = $1
RETURNING id, name, bio`;

export interface UpdateAuthorArgs {
    id: string;
    name: string;
    bio: string | null;
}

export interface UpdateAuthorRow {
    id: string;
    name: string;
    bio: string | null;
}

export async function updateAuthor(client: Client, args: UpdateAuthorArgs): Promise<UpdateAuthorRow | null> {
    const result = await client.query({
        text: updateAuthorQuery,
        values: [args.id, args.name, args.bio],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        name: row[1],
        bio: row[2]
    };
}

export const deleteAuthorQuery = `-- name: DeleteAuthor :exec
DELETE FROM authors
WHERE id = $1`;

export interface DeleteAuthorArgs {
    id: string;
}

export async function deleteAuthor(client: Client, args: DeleteAuthorArgs): Promise<void> {
    await client.query({
        text: deleteAuthorQuery,
        values: [args.id],
        rowMode: "array"
    });
}

