import { supabase } from '../lib/supabase';

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error('Supabase is not configured yet. Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signUpWithEmail(email, password) {
  if (!supabase) throw new Error('Supabase is not configured yet. Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

export async function fetchPlannerData(userId) {
  if (!supabase || !userId) return null;
  const [tasks, notes, reminders] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('daily_notes').select('*').eq('user_id', userId),
    supabase.from('daily_reminders').select('*').eq('user_id', userId),
  ]);
  const firstError = tasks.error || notes.error || reminders.error;
  if (firstError) throw firstError;
  return {
    tasks: tasks.data.map((task) => ({ ...task, detail: task.detail || '', time: task.time || 'Anytime', done: task.done ?? false })),
    notes: Object.fromEntries(notes.data.map((note) => [note.day, note.content])),
    reminders: Object.fromEntries(reminders.data.map((reminder) => [reminder.day, reminder.content])),
  };
}

export async function upsertTask(task, userId) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from('tasks').upsert({ id: task.id, user_id: userId, day: task.day, title: task.title, detail: task.detail, time: task.time, priority: task.priority, done: task.done });
  if (error) throw error;
}

export async function removeTask(taskId, userId) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', userId);
  if (error) throw error;
}

export async function upsertDailyEntry(table, day, content, userId) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from(table).upsert({ user_id: userId, day, content }, { onConflict: 'user_id,day' });
  if (error) throw error;
}