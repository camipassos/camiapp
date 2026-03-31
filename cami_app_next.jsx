// Cami App - Next.js (App Router) + Tailwind
// MVP simples, mobile-first, usando localStorage

'use client'

import { useState, useEffect } from 'react'

// --------- HELPERS ---------
const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']

const getToday = () => new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

const calcVolume = (reps, peso) => reps * peso

const calcCalories = (c, p, g) => c * 4 + p * 4 + g * 9

// --------- STORAGE ---------
const loadData = (key, fallback) => {
  if (typeof window === 'undefined') return fallback
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : fallback
}

const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
}

// --------- APP ---------
export default function App() {
  const [tab, setTab] = useState('treino')
  const [selectedDay, setSelectedDay] = useState(getToday())

  const [treinos, setTreinos] = useState(() => loadData('treinos', {}))
  const [dietas, setDietas] = useState(() => loadData('dietas', {}))

  useEffect(() => saveData('treinos', treinos), [treinos])
  useEffect(() => saveData('dietas', dietas), [dietas])

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <h1 className="text-xl font-bold mb-4">Cami</h1>

      {tab === 'treino' && (
        <Treino
          treinos={treinos}
          setTreinos={setTreinos}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      )}

      {tab === 'evolucao' && <Evolucao treinos={treinos} />}

      {tab === 'dieta' && (
        <Dieta dietas={dietas} setDietas={setDietas} />
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 flex justify-around p-3 text-sm">
        <button onClick={() => setTab('treino')}>Treino</button>
        <button onClick={() => setTab('evolucao')}>Evolução</button>
        <button onClick={() => setTab('dieta')}>Dieta</button>
      </div>
    </div>
  )
}

// --------- TREINO ---------
function Treino({ treinos, setTreinos, selectedDay, setSelectedDay }) {
  const dayKey = days[selectedDay]
  const treinoDia = treinos[dayKey] || []

  const addExercicio = () => {
    const nome = prompt('Nome do exercício')
    if (!nome) return

    const novo = [...treinoDia, { nome, grupo: '', series: [] }]
    setTreinos({ ...treinos, [dayKey]: novo })
  }

  const addSerie = (i) => {
    const reps = Number(prompt('Reps'))
    const peso = Number(prompt('Peso'))
    if (!reps || !peso) return

    const novaSerie = { reps, peso, volume: calcVolume(reps, peso) }

    const novo = [...treinoDia]
    novo[i].series.push(novaSerie)

    setTreinos({ ...treinos, [dayKey]: novo })
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={`px-3 py-1 rounded ${i === selectedDay ? 'bg-white text-black' : 'bg-zinc-800'}`}
          >
            {d}
          </button>
        ))}
      </div>

      <button onClick={addExercicio} className="mb-4 bg-white text-black px-3 py-1 rounded">
        + Exercício
      </button>

      {treinoDia.map((ex, i) => (
        <div key={i} className="mb-4 border border-zinc-700 p-3 rounded">
          <input
            placeholder="Grupo muscular"
            value={ex.grupo}
            onChange={(e) => {
              const novo = [...treinoDia]
              novo[i].grupo = e.target.value
              setTreinos({ ...treinos, [dayKey]: novo })
            }}
            className="bg-transparent border-b mb-2 w-full"
          />

          <h2 className="font-semibold">{ex.nome}</h2>

          {ex.series.map((s, j) => (
            <div key={j} className="text-sm text-zinc-300">
              Série {j + 1}: {s.reps} x {s.peso}kg = {s.volume}
            </div>
          ))}

          <button onClick={() => addSerie(i)} className="text-xs mt-2">
            + Série
          </button>
        </div>
      ))}
    </div>
  )
}

// --------- EVOLUÇÃO ---------
function Evolucao({ treinos }) {
  let totalVolume = 0
  let grupos = {}

  Object.values(treinos).forEach((dia) => {
    dia.forEach((ex) => {
      ex.series.forEach((s) => {
        totalVolume += s.volume
      })

      if (!grupos[ex.grupo]) grupos[ex.grupo] = 0
      grupos[ex.grupo] += ex.series.length
    })
  })

  return (
    <div>
      <h2 className="mb-4">Volume total: {totalVolume}</h2>

      <h3 className="mb-2">Séries por grupo</h3>
      {Object.entries(grupos).map(([g, v]) => (
        <div key={g} className="text-zinc-300">
          {g || 'Sem grupo'}: {v}
        </div>
      ))}
    </div>
  )
}

// --------- DIETA ---------
function Dieta({ dietas, setDietas }) {
  const today = new Date().toISOString().slice(0, 10)
  const dia = dietas[today] || { carb: 0, proteina: 0, gordura: 0, peso: 0 }

  const update = (field, value) => {
    const novo = { ...dia, [field]: Number(value) }
    novo.calorias = calcCalories(novo.carb, novo.proteina, novo.gordura)
    setDietas({ ...dietas, [today]: novo })
  }

  return (
    <div className="flex flex-col gap-3">
      <input placeholder="Carbo" type="number" value={dia.carb} onChange={(e) => update('carb', e.target.value)} />
      <input placeholder="Proteína" type="number" value={dia.proteina} onChange={(e) => update('proteina', e.target.value)} />
      <input placeholder="Gordura" type="number" value={dia.gordura} onChange={(e) => update('gordura', e.target.value)} />
      <input placeholder="Peso" type="number" value={dia.peso} onChange={(e) => update('peso', e.target.value)} />

      <div className="mt-4">
        Calorias: {dia.calorias || 0}
      </div>
    </div>
  )
}
