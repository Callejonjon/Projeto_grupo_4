"use client";
import React, { useState } from 'react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  url: string;
  tags: string[];
}

export default function MuralVagas() {
  const [jobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Analista de Dados / BI (Programa Elas no Mercado Financeiro)',
      company: 'Galapagos Capital',
      location: 'São Paulo, SP (Híbrido)',
      type: 'CLT / Programa',
      url: 'https://galapagoscapital.com/vagas/',
      tags: ['Power BI', 'SQL', 'Finanças', 'Python']
    },
    {
      id: '2',
      title: 'Analista de Business Intelligence Jr',
      company: 'Itaú Unibanco',
      location: 'São Paulo, SP',
      type: 'CLT',
      url: 'https://vemparaoritau.com.br/',
      tags: ['SQL', 'Power BI', 'Modelagem']
    },
    {
      id: '3',
      title: 'Analista de Dados & Riscos',
      company: 'XP Inc.',
      location: 'São Paulo, SP',
      type: 'CLT',
      url: 'https://www.xpi.com.br/carreiras/',
      tags: ['Python', 'SQL', 'Risk Analytics']
    },
    {
      id: '4',
      title: 'Analista de Operações e Dados Financeiros',
      company: 'BTG Pactual',
      location: 'São Paulo, SP',
      type: 'CLT',
      url: 'https://www.btgpactual.com/carreiras',
      tags: ['Excel Avançado', 'Processos', 'SQL']
    },
    {
      id: '5',
      title: 'Analista de Dados para Crédito e Renda Fixa',
      company: 'Nubank',
      location: 'São Paulo, SP / Remoto',
      type: 'CLT',
      url: 'https://nubank.com.br/carreiras/',
      tags: ['Python', 'Data Analytics', 'Fintech']
    },
    {
      id: '6',
      title: 'Assistente de Inteligência de Mercado e Dados',
      company: 'Safra',
      location: 'São Paulo, SP',
      type: 'CLT',
      url: 'https://www.safra.com.br/carreiras.htm',
      tags: ['Power BI', 'Mercado Financeiro', 'SQL']
    }
  ]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mural de Vagas • Mercado Financeiro & Dados</h2>
          <p className="text-xs text-slate-500">
            Oportunidades em asset management, investment banking e grandes instituições financeiras.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <a
            key={job.id}
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-slate-200 hover:border-pink-500 rounded-xl p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between group bg-slate-50/50 hover:bg-white"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-pink-600 transition-colors">
                  {job.title}
                </h3>
                <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {job.type}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-700 mb-1">{job.company}</p>
              <p className="text-xs text-slate-500 mb-3">📍 {job.location}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
              <div className="flex flex-wrap gap-1">
                {job.tags.map((tag, idx) => (
                  <span key={idx} className="bg-slate-200/70 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs font-bold text-pink-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Candidatar-se →
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
