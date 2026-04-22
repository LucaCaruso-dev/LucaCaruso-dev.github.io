/**
 * SayHi! — Chatbot AI
 * Project Work — Zucchetti Academy
 *
 * Uses Transformers.js with the "question-answering" pipeline
 * to answer questions based on a given context text.
 */

//import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0';
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers';
// ─── Default context ──────────────────────────────────────────────────────────

const DEFAULT_CONTEXT = `SayHi is a chatbot created to interact with people in a friendly and helpful way. The chatbot's name is SayHi. SayHi was developed by students of Zucchetti Academy as a school project. SayHi can answer questions on many everyday topics.

Common greetings in English are: hello, hi, good morning, good afternoon, good evening, goodbye, see you later. When someone says hello or hi, they are greeting you. A proper response to a greeting is to greet back and ask how the person is doing. When someone asks how you are, you can reply that you are doing well, great, so-so, or not great.

Free time includes many enjoyable activities. Reading books is a very popular hobby. Watching movies and TV series is a widespread pastime. Sports are important for health: you can go jogging, go to the gym, swim, play football, tennis, or volleyball. Music is another common hobby: you can play an instrument, listen to songs, or go to concerts. Cooking is both a necessity and a pleasure for many people.

Italian food is famous all over the world. Pizza originates from Naples and is one of the most loved dishes globally. Pasta comes in many shapes: spaghetti, penne, rigatoni, tagliatelle, fusilli. Risotto is a classic first course from northern Italy. Tiramisu is an Italian dessert made with mascarpone, coffee, and ladyfingers. Espresso coffee is the symbol of Italy: it is usually drunk standing at a bar in the morning. A typical Italian breakfast includes a cappuccino and a croissant. Lunch is the main meal of the day and is eaten around noon. Dinner is usually between 7 and 9 pm.

The four seasons are spring, summer, autumn, and winter. In spring the temperatures are mild and flowers bloom. Summer is the hottest season, with temperatures in Italy sometimes exceeding 35 degrees Celsius. Autumn is characterized by leaves changing color and falling temperatures. Winter is the coldest season; it often snows in the mountains. When it rains you use an umbrella. The sun shines on clear days. When it is hot, light clothes are preferred; when it is cold, coats and sweaters are worn.

The world of technology changes rapidly. The smartphone has become an indispensable tool in everyday life: it is used for calling, messaging, browsing the internet, listening to music, and much more. Computers are essential for work and study. The internet allows access to information from around the world in seconds. Social networks such as Instagram, Facebook, and TikTok are used by millions of people to share content and stay in touch with friends and family. Artificial intelligence is a rapidly growing technology that allows machines to perform tasks previously reserved for humans.

Study and work are important parts of life. Going to school helps learn fundamental concepts and develop critical thinking. University offers specialized training in many fields: medicine, engineering, law, economics, humanities, and computer science. Work occupies much of an adult day. Many people work in offices, others in shops, factories, at home, or outdoors. The typical work week runs from Monday to Friday, with the weekend off. Holidays are a time for rest and leisure.

The main colors are red, blue, green, yellow, orange, purple, white, black, grey, and brown. The days of the week are Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, and Sunday. The months of the year are January, February, March, April, May, June, July, August, September, October, November, and December.

The most common pets are dogs and cats. Dogs are loyal and affectionate; cats are independent and curious. Other pets include fish, hamsters, rabbits, and birds. Among Italian wildlife we find wolves, eagles, foxes, wild boars, and deer.

Travel is a fantastic way to discover the world. The most visited Italian cities by tourists are Rome, Milan, Venice, Florence, and Naples. Rome is the capital of Italy and is famous for the Colosseum, the Trevi Fountain, and the Vatican. Milan is the center of fashion and finance. Venice is unique in the world for its canals. Florence is the cradle of the Renaissance. The most popular foreign destinations for Italians are Spain, Greece, France, Croatia, and Egypt.

Emotions are part of everyone life. Happiness is the pleasant feeling experienced when things go well. Sadness comes in difficult moments. Anger is a reaction to situations perceived as unfair. Fear protects us from danger. Love is one of the deepest feelings and involves family, friends, and partners. When tired, it is important to rest and sleep enough. An adult should sleep between 7 and 9 hours per night.

Health is the most precious asset. To stay healthy it is important to eat a balanced diet, exercise regularly, sleep well, and reduce stress. The family doctor is the first point of contact for health problems. In an emergency you call 911 in the US or 118 in Italy. Fruits and vegetables are essential for a healthy diet. Drinking at least 1.5 liters of water per day is recommended by nutritionists.`;

// ─── App state ────────────────────────────────────────────────────────────────

let qaModel = null;
let appliedContext = DEFAULT_CONTEXT;
let isProcessing = false;

// ─── DOM references ───────────────────────────────────────────────────────────

const loadingOverlay  = document.getElementById('loading-overlay');
const loaderText      = document.getElementById('loader-text');
const chatMessages    = document.getElementById('chat-messages');
const userInput       = document.getElementById('user-input');
const sendBtn         = document.getElementById('send-btn');
const contextArea     = document.getElementById('context-area');
const statusBadge     = document.getElementById('status-badge');
const statusText      = document.getElementById('status-text');
const sidebar         = document.getElementById('sidebar');
const toggleSidebar   = document.getElementById('toggle-sidebar');
const sidebarTab      = document.getElementById('sidebar-tab');
const clearContextBtn = document.getElementById('clear-context-btn');
const applyContextBtn = document.getElementById('apply-context-btn');

// ─── Initialization ───────────────────────────────────────────────────────────

contextArea.value = DEFAULT_CONTEXT;

async function initModel() {
  try {
    loaderText.textContent = 'Downloading model (first time may take a few minutes)…';
    setStatus('loading', 'Loading model…');

    qaModel = await pipeline(
      'question-answering',
      'Xenova/distilbert-base-cased-distilled-squad'
    );

    loadingOverlay.classList.add('hidden');
    setStatus('ready', 'Model ready');
    userInput.disabled = false;

    addBotMessage(
      'Hi! I\'m <strong>SayHi!</strong>, your AI assistant. ' +
      'Ask me anything based on the text in the left panel — I\'ll answer using that as my knowledge base. ' +
      'You can also paste any custom English text there. 💬'
    );

  } catch (err) {
    console.error('[SayHi] Model init error:', err);
    loaderText.textContent = 'Error loading the model. Please reload the page.';
    setStatus('error', 'Model error');
  }
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function setStatus(type, label) {
  statusBadge.className = `status-badge ${type}`;
  statusText.textContent = label;
}

// ─── Chat messages ────────────────────────────────────────────────────────────

function addBotMessage(html, score = null) {
  const div = document.createElement('div');
  div.className = 'message bot-message';

  const scoreHtml = (score !== null)
    ? `<span class="score">Confidence: ${(score * 100).toFixed(1)}%</span>`
    : '';

  div.innerHTML = `
    <div class="message-avatar">AI</div>
    <div class="message-content">
      <p>${html}</p>
      ${scoreHtml}
    </div>`;

  chatMessages.appendChild(div);
  scrollBottom();
}

function addUserMessage(text) {
  const div = document.createElement('div');
  div.className = 'message user-message';
  div.innerHTML = `
    <div class="message-content"><p>${escapeHtml(text)}</p></div>
    <div class="message-avatar">You</div>`;
  chatMessages.appendChild(div);
  scrollBottom();
}

function addTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'message bot-message';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <div class="message-avatar">AI</div>
    <div class="message-content">
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    </div>`;
  chatMessages.appendChild(div);
  scrollBottom();
}

function removeTypingIndicator() {
  document.getElementById('typing-indicator')?.remove();
}

function scrollBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ─── Send message ─────────────────────────────────────────────────────────────

async function sendMessage() {
  if (isProcessing || !qaModel) return;

  const question = userInput.value.trim();
  if (!question) return;

  if (!appliedContext.trim()) {
    showToast('Please add some text in the left panel and click "Apply context" first.');
    return;
  }

  isProcessing = true;
  sendBtn.disabled = true;
  userInput.disabled = true;
  setStatus('loading', 'Processing…');

  addUserMessage(question);
  userInput.value = '';
  autoResize(userInput);
  addTypingIndicator();

  try {
    const result = await qaModel(question, appliedContext);
    removeTypingIndicator();

    /*if (result.score < 0.01 || !result.answer || result.answer.trim().length === 0) {
      addBotMessage(
        'I could not find a relevant answer in the context text. ' +
        'Try rephrasing your question or updating the knowledge base on the left.',
        result.score
      );
    } else {*/
      addBotMessage(escapeHtml(result.answer), result.score);
    //}

  } catch (err) {
    console.error('[SayHi] QA error:', err);
    removeTypingIndicator();
    addBotMessage('An error occurred while processing your question. Please try again.');
  }

  isProcessing = false;
  sendBtn.disabled = false;
  userInput.disabled = false;
  userInput.focus();
  setStatus('ready', 'Model ready');
}

// ─── Sidebar toggle ───────────────────────────────────────────────────────────

function collapseSidebar() {
  sidebar.classList.add('collapsed');
  sidebarTab.classList.remove('hidden');
}

function expandSidebar() {
  sidebar.classList.remove('collapsed');
  sidebarTab.classList.add('hidden');
}

// ─── Context ──────────────────────────────────────────────────────────────────

function applyContext() {
  const newCtx = contextArea.value.trim();
  if (!newCtx) {
    showToast('Context cannot be empty.');
    return;
  }
  appliedContext = newCtx;
  showToast('✓ Context updated successfully!');
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(message) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 140) + 'px';
}

// ─── Event listeners ──────────────────────────────────────────────────────────

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener('input', () => autoResize(userInput));

toggleSidebar.addEventListener('click', collapseSidebar);
sidebarTab.addEventListener('click', expandSidebar);
applyContextBtn.addEventListener('click', applyContext);

clearContextBtn.addEventListener('click', () => {
  contextArea.value = '';
  contextArea.focus();
});

// ─── Start ────────────────────────────────────────────────────────────────────

initModel();
