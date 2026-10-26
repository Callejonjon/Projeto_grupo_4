"use client";
import React, { useState, useRef, useEffect } from 'react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Olá! Sou sua Mentora Virtual. Estou aqui para te ajudar a entender o mercado, descomplicar o economês e acompanhar as notícias do dia. Como posso te ajudar hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Adiciona a mensagem da usuária e mantém o histórico de memória da sessão
    const newMessages: Message[] = [...messages, { sender: 'user', text: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Simulação de resposta inteligente com escopo expandido (Notícias, Economês e Mentoria)
      // Aqui você pode plugar a chamada para a sua API da OpenAI (ChatGPT) usando os créditos que você recebeu.
      setTimeout(() => {
        let botResponse = "Essa é uma excelente pergunta sobre o cenário atual. O mercado financeiro está focado na movimentação das taxas de juros e nos impactos globais. Quer que eu detalhe como isso afeta seus investimentos?";
        
        const lower = userMessage.toLowerCase();
        if (lower.includes('notícia') || lower.includes('hoje') || lower.includes('mercado')) {
          botResponse = "📰 **Destaque de Mercado de Hoje:** O Tesouro Direto bateu recordes de investidoras (mulheres já são 31% da base), e o Ibovespa opera em compasso de espera com os desdobramentos da inflação e da taxa Selic. Como posso te ajudar a navegar por esses dados?";
        } else if (lower.includes('selic') || lower.includes('cdi') || lower.includes('inflação')) {
          botResponse = "📈 A Selic alta encarece o crédito, mas traz ótimas oportunidades para a renda fixa pós-fixada (como Tesouro Selic e CDBs). É o famoso 'preço do dinheiro' subindo para segurar a inflação. Tem alguma dúvida de como aplicar nisso na prática?";
        }

        setMessages([...newMessages, { sender: 'bot', text: botResponse }]);
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Erro no chatbot:', error);
      setMessages([...newMessages, { sender: 'bot', text: 'Desculpe, tive um breve instabilidade. Pode repetir sua dúvida?' }]);
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
        >
          💬
        </button>
      ) : (
        <div className="bg-white border border-slate-200 w-80 md:w-96 rounded-2xl shadow-2xl flex flex-col h-[500px] overflow-hidden">
          {/* Cabeçalho */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Mentora Virtual</h3>
              <p className="text-[10px] text-slate-400">Espaço seguro • Mercado, Notícias e Carreira</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>
          </div>

          {/* Histórico de Mensagens (Com Memória da Sessão) */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-pink-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-500 border border-slate-200 p-3 rounded-xl rounded-bl-none shadow-sm text-xs animate-pulse">
                  Analisando o mercado...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Caixa de Entrada */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre notícias, juros ou mercado..."
              className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
