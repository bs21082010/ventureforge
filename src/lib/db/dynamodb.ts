import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const PLANS_TABLE = process.env.DYNAMODB_PLANS_TABLE || "ventureforge-plans";

export interface DynamoPlan {
  pk: string; // plan ID
  sk: string; // "META" | "SECTION#0" | "SECTION#1" | etc.
  title: string;
  description: string;
  industry: string;
  region: string;
  status: string;
  version: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  // Section fields
  sectionType?: string;
  sectionTitle?: string;
  content?: string;
  order?: number;
}

export async function savePlan(plan: any): Promise<void> {
  const now = new Date().toISOString();
  const commands: PutCommand[] = [];

  // Save plan metadata
  commands.push(new PutCommand({
    TableName: PLANS_TABLE,
    Item: {
      pk: plan.id,
      sk: "META",
      title: plan.title,
      description: plan.description || "",
      industry: plan.industry,
      region: plan.region,
      status: plan.status || "DRAFT",
      version: plan.version || 1,
      ownerId: plan.ownerId || "local",
      createdAt: plan.createdAt || now,
      updatedAt: now,
    },
  }));

  // Save sections
  if (plan.sections) {
    for (let i = 0; i < plan.sections.length; i++) {
      const s = plan.sections[i];
      commands.push(new PutCommand({
        TableName: PLANS_TABLE,
        Item: {
          pk: plan.id,
          sk: `SECTION#${i}`,
          sectionType: s.type,
          sectionTitle: s.title,
          content: typeof s.content === "string" ? s.content : JSON.stringify(s.content || {}),
          order: s.order ?? i,
        },
      }));
    }
  }

  // Save assumptions
  if (plan.assumptions) {
    for (let i = 0; i < plan.assumptions.length; i++) {
      const a = plan.assumptions[i];
      commands.push(new PutCommand({
        TableName: PLANS_TABLE,
        Item: {
          pk: plan.id,
          sk: `ASSUMPTION#${i}`,
          category: a.category,
          name: a.name,
          value: a.value,
          unit: a.unit || "",
          isDynamic: a.isDynamic ?? false,
        },
      }));
    }
  }

  for (const cmd of commands) {
    await dynamo.send(cmd);
  }
}

export async function getPlan(id: string): Promise<any | null> {
  const result = await dynamo.send(new QueryCommand({
    TableName: PLANS_TABLE,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": id },
  }));

  if (!result.Items || result.Items.length === 0) return null;

  const meta = result.Items.find((i) => i.sk === "META");
  if (!meta) return null;

  const sections = result.Items
    .filter((i) => i.sk.startsWith("SECTION#"))
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((s) => ({
      type: s.sectionType,
      title: s.sectionTitle,
      content: s.content ? JSON.parse(s.content) : { text: "" },
      order: s.order,
    }));

  const assumptions = result.Items
    .filter((i) => i.sk.startsWith("ASSUMPTION#"))
    .map((a) => ({
      category: a.category,
      name: a.name,
      value: a.value,
      unit: a.unit,
      isDynamic: a.isDynamic,
    }));

  return { ...meta, sections, assumptions };
}

export async function listPlans(ownerId?: string): Promise<any[]> {
  const result = await dynamo.send(new ScanCommand({
    TableName: PLANS_TABLE,
    FilterExpression: "sk = :sk",
    ExpressionAttributeValues: { ":sk": "META" },
  }));

  let plans = ((result.Items || []) as any[]).map((i: any) => ({
    id: i.pk,
    title: i.title,
    description: i.description,
    industry: i.industry,
    region: i.region,
    status: i.status,
    version: i.version,
    ownerId: i.ownerId,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  }));

  if (ownerId) {
    plans = plans.filter((p) => p.ownerId === ownerId || p.ownerId === "local");
  }

  return plans.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export async function deletePlan(id: string): Promise<void> {
  const result = await dynamo.send(new QueryCommand({
    TableName: PLANS_TABLE,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": id },
  }));

  if (result.Items) {
    for (const item of result.Items) {
      await dynamo.send(new DeleteCommand({
        TableName: PLANS_TABLE,
        Key: { pk: item.pk, sk: item.sk },
      }));
    }
  }
}

export function isDynamoDBSet(): boolean {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}
