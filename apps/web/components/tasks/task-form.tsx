"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTaskStore } from "@/stores/task-store";
import { validateNewTask, MAX_POMODOROS_ESTIMADOS } from "@/lib/task";

export function TaskForm() {
  const add = useTaskStore((s) => s.add);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [estimados, setEstimados] = useState(1);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const input = { titulo, descricao, pomodorosEstimados: estimados };
    const validationError = validateNewTask(input);
    if (validationError) {
      setErro(validationError);
      return;
    }
    setSalvando(true);
    try {
      await add(input);
      setTitulo("");
      setDescricao("");
      setEstimados(1);
      setErro(null);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        value={titulo}
        onChange={(event) => setTitulo(event.target.value)}
        placeholder="Nova tarefa"
        aria-label="Título da tarefa"
        aria-invalid={erro != null}
      />
      <Input
        value={descricao}
        onChange={(event) => setDescricao(event.target.value)}
        placeholder="Descrição (opcional)"
        aria-label="Descrição da tarefa"
      />
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          🍅 estimados
          <Input
            type="number"
            min={0}
            max={MAX_POMODOROS_ESTIMADOS}
            value={estimados}
            onChange={(event) => setEstimados(event.target.valueAsNumber)}
            aria-label="Pomodoros estimados"
            className="w-16"
          />
        </label>
        <Button type="submit" disabled={salvando} className="ml-auto">
          <Plus />
          Adicionar
        </Button>
      </div>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
    </form>
  );
}
