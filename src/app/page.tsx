"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Recipe, WeekPlan } from "@/lib/types";
import { getCurrentWeekId, getWeekNumber, offsetWeek, getWeekDayLabels } from "@/lib/weeks";
import Image from "next/image";
import TabBar from "@/components/TabBar";
import RecipePicker from "@/components/RecipePicker";
import RecipeSheet from "@/components/RecipeSheet";

const NUM_SLOTS = 5;

export default function WeekView() {
  const [weekId, setWeekId] = useState(getCurrentWeekId());
  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [generating, setGenerating] = useState(false);
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [actionSlot, setActionSlot] = useState<number | null>(null);
  const [viewSlot, setViewSlot] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const weekNumber = getWeekNumber(weekId);
  const isCurrentWeek = weekId === getCurrentWeekId();
  const dayLabels = getWeekDayLabels(plan?.slots.length || NUM_SLOTS);

  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then(setRecipes);
  }, []);

  const fetchPlan = useCallback(() => {
    fetch(`/api/weeks/${weekId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.slots) setPlan(data);
        else setPlan(null);
      });
  }, [weekId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const getRecipe = (id: string | null): Recipe | undefined =>
    id ? recipes.find((r) => r.id === id) : undefined;

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await fetch(`/api/weeks/${weekId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numSlots: NUM_SLOTS }),
    });
    const data = await res.json();
    setPlan(data);
    setGenerating(false);
  };

  const handleReroll = async (slotIndex: number) => {
    if (!plan) return;
    const res = await fetch(`/api/weeks/${weekId}/reroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotIndex, currentIds: plan.slots }),
    });
    const data = await res.json();
    setPlan(data);
    setActionSlot(null);
  };

  const handlePickRecipe = async (recipeId: string) => {
    if (pickerSlot === null || !plan) return;
    const newSlots = [...plan.slots];
    newSlots[pickerSlot] = recipeId;
    const res = await fetch(`/api/weeks/${weekId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...plan, slots: newSlots }),
    });
    const data = await res.json();
    setPlan(data);
    setPickerSlot(null);
  };

  const handleRemove = async (slotIndex: number) => {
    if (!plan) return;
    const newSlots = [...plan.slots];
    newSlots[slotIndex] = null;
    const res = await fetch(`/api/weeks/${weekId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...plan, slots: newSlots }),
    });
    const data = await res.json();
    setPlan(data);
    setActionSlot(null);
  };

  // Long press handlers for edit mode
  const handlePointerDown = (slotIndex: number) => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setActionSlot(slotIndex);
    }, 500);
  };

  const handlePointerUp = (slotIndex: number) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!didLongPress.current) {
      if (editMode) {
        setActionSlot(slotIndex);
      } else {
        setViewSlot(slotIndex);
      }
    }
  };

  const handlePointerCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const viewRecipe = viewSlot !== null && plan ? getRecipe(plan.slots[viewSlot]) : undefined;

  return (
    <div className="pb-24 min-h-dvh">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekId(offsetWeek(weekId, -1))}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-warm-100 active:bg-warm-200 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-warm-800">Vecka {weekNumber}</h1>
            {plan && (
              <button
                onClick={() => { setEditMode(!editMode); setActionSlot(null); }}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  editMode ? "bg-warm-700" : "bg-warm-200/60"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={editMode ? "#fff" : "#A06030"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setWeekId(offsetWeek(weekId, 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-warm-100 active:bg-warm-200 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* Empty state or grid */}
      {!plan ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8" style={{ minHeight: "calc(100dvh - 180px)" }}>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="group flex flex-col items-center gap-6 active:scale-[0.96] transition-transform disabled:opacity-70"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-warm-200 to-warm-300 flex items-center justify-center shadow-lg group-active:shadow-md transition-shadow">
              <span className={`text-3xl ${generating ? "animate-spin" : ""}`}>✨</span>
            </div>
            <div>
              <p className="text-xl font-semibold text-warm-800 mb-1.5">
                {generating ? "Skapar meny..." : "Skapa veckans meny"}
              </p>
              <p className="text-sm text-warm-400 max-w-[220px]">
                {generating ? "Väljer ut veckans middagar" : "Tryck här för att fylla veckan med middagar"}
              </p>
            </div>
          </button>
        </div>
      ) : (
        <div className="px-4">
          {/* 2-column grid */}
          <div className="grid grid-cols-2 gap-3">
            {plan.slots.map((recipeId, i) => {
              const recipe = getRecipe(recipeId);
              const isLastOdd = i === plan.slots.length - 1 && plan.slots.length % 2 === 1;
              return (
                <div
                  key={i}
                  className={`relative rounded-2xl overflow-hidden shadow-sm ${
                    isLastOdd ? "col-span-2 h-48" : "aspect-square"
                  }`}
                >
                  {recipe ? (
                    <button
                      onPointerDown={() => handlePointerDown(i)}
                      onPointerUp={() => handlePointerUp(i)}
                      onPointerCancel={handlePointerCancel}
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full h-full relative select-none"
                    >
                      <Image
                        src={recipe.image}
                        alt={recipe.name}
                        fill
                        className="object-cover pointer-events-none"
                        sizes={isLastOdd ? "100vw" : "50vw"}
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      {editMode && (
                        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#704020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-[10px] font-medium text-white/70 uppercase tracking-wider">
                          {dayLabels[i]}
                        </p>
                        <p className="text-sm font-semibold text-white leading-tight mt-0.5">
                          {recipe.name}
                        </p>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => setPickerSlot(i)}
                      className="w-full h-full border-2 border-dashed border-warm-300 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-warm-400 hover:bg-warm-100/50 transition-colors"
                    >
                      <span className="text-2xl text-warm-400">+</span>
                      <span className="text-sm text-warm-400">{dayLabels[i]}</span>
                    </button>
                  )}

                  {/* Action overlay (long press) */}
                  {actionSlot === i && recipe && (
                    <div
                      className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 p-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleReroll(i)}
                        className="w-full bg-white text-warm-800 py-2.5 rounded-xl text-sm font-medium active:scale-[0.97] transition-transform"
                      >
                        🎲 Ge mig en annan
                      </button>
                      <button
                        onClick={() => {
                          setActionSlot(null);
                          setPickerSlot(i);
                        }}
                        className="w-full bg-white text-warm-800 py-2.5 rounded-xl text-sm font-medium active:scale-[0.97] transition-transform"
                      >
                        🔄 Byt ut
                      </button>
                      <button
                        onClick={() => handleRemove(i)}
                        className="w-full bg-white text-warm-800 py-2.5 rounded-xl text-sm font-medium active:scale-[0.97] transition-transform"
                      >
                        ✕ Ta bort
                      </button>
                      <button
                        onClick={() => setActionSlot(null)}
                        className="w-full text-white/80 py-2 text-sm mt-1"
                      >
                        Avbryt
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add slot card */}
          {editMode && plan.slots.length < 7 && (
            <div className="mt-3">
              <button
                onClick={async () => {
                  if (!plan) return;
                  const newSlots = [...plan.slots, null];
                  const res = await fetch(`/api/weeks/${weekId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...plan, slots: newSlots, numSlots: newSlots.length }),
                  });
                  const data = await res.json();
                  setPlan(data);
                }}
                className="w-full py-3 border-2 border-dashed border-warm-300 rounded-2xl flex items-center justify-center gap-2 text-warm-400 hover:border-warm-400 hover:text-warm-500 hover:bg-warm-50 transition-colors"
              >
                <span className="text-lg">+</span>
                <span className="text-sm font-medium">Lägg till en dag</span>
              </button>
            </div>
          )}

          {/* Regenerate link */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="text-warm-500 text-sm font-medium flex items-center gap-1.5 hover:text-warm-700 active:text-warm-800 transition-colors disabled:opacity-50"
            >
              {generating ? "Skapar ny meny..." : "✨ Generera ny meny"}
            </button>
          </div>
        </div>
      )}

      {/* Recipe detail sheet (tap) */}
      {viewRecipe && viewSlot !== null && (
        <RecipeSheet
          recipe={viewRecipe}
          dayLabel={dayLabels[viewSlot]}
          onClose={() => setViewSlot(null)}
        />
      )}

      {/* Recipe picker modal */}
      {pickerSlot !== null && (
        <RecipePicker
          recipes={recipes}
          currentIds={plan?.slots || []}
          onPick={handlePickRecipe}
          onClose={() => setPickerSlot(null)}
        />
      )}

      <TabBar active="veckan" />
    </div>
  );
}
