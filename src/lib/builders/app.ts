import { aiJsonCompletion, isAnyAI } from "@/lib/ai/ai-client";

export interface AppRequest {
  prompt: string;
  platform?: "expo" | "react-native";
}

export interface AppResult {
  code: string;
  screens: string[];
  title: string;
  techStack: string[];
  buildSteps: string[];
}

function generateAppLocal(request: AppRequest): AppResult {
  const p = request.prompt.toLowerCase();
  let title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "MyApp";
  let screens: string[] = [];
  let code = "";

  if (p.includes("todo") || p.includes("task") || p.includes("list") || p.includes("checklist")) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "TaskFlow";
    screens = ["Home (Task List)", "Add Task", "Edit Task", "Settings"];
    code = `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, StatusBar } from 'react-native';

export default function App() {
  const [tasks, setTasks] = useState<{id: string; text: string; done: boolean}[]>([]);
  const [input, setInput] = useState('');

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: input, done: false }]);
    setInput('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>${title}</Text>
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Add a task..." placeholderTextColor="#666" />
        <TouchableOpacity style={styles.addBtn} onPress={addTask}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
      </View>
      <FlatList data={tasks} keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.task} onPress={() => toggleTask(item.id)}>
            <Text style={[styles.taskText, item.done && styles.done]}>{item.text}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tasks yet. Add one above!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  inputRow: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#1e293b', color: '#fff', padding: 14, borderRadius: 10, fontSize: 16 },
  addBtn: { backgroundColor: '#3b82f6', width: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  addBtnText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  task: { backgroundColor: '#1e293b', padding: 16, borderRadius: 10, marginBottom: 10 },
  taskText: { color: '#fff', fontSize: 16 },
  done: { textDecorationLine: 'line-through', color: '#6b7280' },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 40, fontSize: 16 },
});`;
  } else if (p.includes("chat") || p.includes("messenger") || p.includes("message")) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "ChatWave";
    screens = ["Chat List", "Conversation", "Profile", "Settings"];
    code = `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, StatusBar } from 'react-native';

export default function App() {
  const [messages, setMessages] = useState<{id: string; text: string; me: boolean}[]>([]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), text: input, me: true }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), text: 'Thanks for your message! This is an automated reply from ${title}.', me: false }]);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>${title}</Text>
      <FlatList data={messages} keyExtractor={item => item.id} style={styles.chat}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.me ? styles.myBubble : styles.theirBubble]}>
            <Text style={[styles.bubbleText, item.me ? styles.myText : styles.theirText]}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type a message..." placeholderTextColor="#666" />
        <TouchableOpacity style={styles.sendBtn} onPress={send}><Text style={styles.sendText}>Send</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 16, textAlign: 'center' },
  chat: { flex: 1 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
  myBubble: { backgroundColor: '#3b82f6', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#1e293b', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, color: '#fff' },
  myText: { color: '#fff' },
  theirText: { color: '#e2e8f0' },
  inputRow: { flexDirection: 'row', marginVertical: 12 },
  input: { flex: 1, backgroundColor: '#1e293b', color: '#fff', padding: 14, borderRadius: 12, fontSize: 15 },
  sendBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  sendText: { color: '#fff', fontWeight: '600' },
});`;
  } else if (p.includes("weather") || p.includes("forecast") || p.includes("climate")) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "WeatherNow";
    screens = ["Home (Current Weather)", "Forecast", "Cities", "Settings"];
    code = `import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';

const CITIES = ['New York', 'London', 'Tokyo', 'Sydney', 'Mumbai'];
const ICONS: Record<string, string> = { Clear: '☀️', Clouds: '☁️', Rain: '🌧', Snow: '❄️', Drizzle: '🌦', Thunderstorm: '⛈' };

function WeatherCard({ city }: { city: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch(\`https://api.open-meteo.com/v1/forecast?latitude=\${[40.71,51.51,35.68,-33.87,19.08][CITIES.indexOf(city)]}&longitude=\${[-74.01,-0.13,139.69,151.21,72.88][CITIES.indexOf(city)]}&current_weather=true\`)
      .then(r => r.json()).then(d => setData(d.current_weather)).catch(() => setData({ temperature: Math.random()*30+5, weathercode: Math.floor(Math.random()*5) }));
  }, []);
  const codes = ['Clear','Clouds','Rain','Snow','Drizzle'];
  const icon = data ? ICONS[codes[data.weathercode]||'Clear'] : '⏳';
  return (
    <View style={styles.card}>
      <Text style={styles.city}>{city}</Text>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.temp}>{data ? Math.round(data.temperature)+'°C' : '...'}</Text>
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${title}</Text>
      <FlatList data={CITIES} keyExtractor={i => i} renderItem={({ item }) => <WeatherCard city={item} />} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  city: { fontSize: 20, fontWeight: '600', color: '#e2e8f0' },
  icon: { fontSize: 32 },
  temp: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6' },
});`;
  } else {
    screens = ["Home", "Profile", "Settings", "About"];
    code = `import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ${title}</Text>
      <Text style={styles.subtitle}>Your app is ready. Start building!</Text>
      <View style={styles.card}>
        <Text style={styles.feature}>📱 Cross-Platform</Text>
        <Text style={styles.feature}>⚡ Fast Performance</Text>
        <Text style={styles.feature}>🎨 Beautiful UI</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 40 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 24, width: '100%' },
  feature: { fontSize: 18, color: '#e2e8f0', marginBottom: 12 },
});`;
  }

  return {
    code,
    screens,
    title,
    techStack: ["React Native", "Expo", "TypeScript"],
    buildSteps: [
      "npx create-expo-app " + title.toLowerCase().replace(/\s+/g, '-'),
      "npx expo start",
      "npx eas build --platform all",
    ],
  };
}

export async function generateApp(request: AppRequest): Promise<AppResult> {
  const prompt = `Generate a complete ${request.platform || "Expo/React Native"} mobile app based on this description: "${request.prompt}"

Return JSON:
{
  "code": "complete App.tsx React Native component code",
  "screens": ["list of screen names"],
  "title": "app title",
  "techStack": ["array of technologies"],
  "buildSteps": ["array of build commands"]
}`;

  const available = await isAnyAI();
  if (available) {
    try {
      const systemPrompt = "You are a mobile app developer. Generate complete app code. Return only valid JSON.";
      return await aiJsonCompletion<AppResult>(systemPrompt, prompt, { temperature: 0.7, maxTokens: 4096 });
    } catch {}
  }

  return generateAppLocal(request);
}
