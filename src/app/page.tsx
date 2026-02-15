"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Recipe, WeekPlan } from "@/lib/types";
import { getCurrentWeekId, getWeekNumber, offsetWeek, getWeekDayLabels } from "@/lib/weeks";
import Image from "next/image";
import TabBar from "@/components/TabBar";
import RecipePicker from "@/components/RecipePicker";
import RecipeSheet from "@/components/RecipeSheet";
import { ChevronLeft, ChevronRight, Pencil, Plus, Sparkles, Shuffle, ArrowLeftRight, Trash2 } from "lucide-react";

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
      <div className="px-5 pt-3 pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekId(offsetWeek(weekId, -1))}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-warm-200 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-warm-800">Vecka {weekNumber}</h1>
            {plan && (
              <button
                onClick={() => { setEditMode(!editMode); setActionSlot(null); }}
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                  editMode ? "bg-warm-700" : "bg-warm-200"
                }`}
              >
                <Pencil size={13} color={editMode ? "#F5F0EB" : "#705E4A"} strokeWidth={2.5} />
              </button>
            )}
          </div>
          <button
            onClick={() => setWeekId(offsetWeek(weekId, 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-warm-200 transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      {/* Empty state or grid */}
      {!plan ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-10" style={{ minHeight: "calc(100dvh - 140px)" }}>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-warm-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg active:scale-[0.97] active:bg-warm-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Sparkles size={20} className="animate-spin" />
                Skapar meny...
              </>
            ) : (
              <>
                Skapa veckans meny
                <Sparkles size={20} />
              </>
            )}
          </button>
          <p className="text-sm text-warm-400 mt-3">
            {generating ? "Väljer ut veckans middagar" : "Förslag baserat på dina recept"}
          </p>
        </div>
      ) : (
        <div>
          {/* 2-column grid */}
          <div className="grid grid-cols-2">
            {plan.slots.map((recipeId, i) => {
              const recipe = getRecipe(recipeId);
              const isLastOdd = i === plan.slots.length - 1 && plan.slots.length % 2 === 1;
              return (
                <div
                  key={i}
                  className={`relative overflow-hidden border-[0.5px] border-warm-300 ${
                    isLastOdd ? "col-span-2 h-44" : "aspect-square"
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
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center pointer-events-none">
                          <Pencil size={12} color="#705E4A" strokeWidth={2.5} />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
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
                      className="w-full h-full bg-warm-100 flex flex-col items-center justify-center gap-1 active:bg-warm-200 transition-colors"
                    >
                      <Plus size={24} className="text-warm-400" strokeWidth={1.5} />
                      <span className="text-xs text-warm-500 font-medium">{dayLabels[i]}</span>
                    </button>
                  )}

                  {/* Action overlay */}
                  {actionSlot === i && recipe && (
                    <div
                      className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5 px-4"
                      onClick={() => setActionSlot(null)}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReroll(i); }}
                        className="w-full bg-white text-warm-800 py-2 rounded-xl text-[13px] font-medium active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5"
                      >
                        <Shuffle size={14} /> Slumpa
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActionSlot(null); setPickerSlot(i); }}
                        className="w-full bg-white text-warm-800 py-2 rounded-xl text-[13px] font-medium active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeftRight size={14} /> Byt ut
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
                        className="w-full bg-white text-warm-800 py-2 rounded-xl text-[13px] font-medium active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5"
                      >
                        <Trash2 size={14} /> Ta bort
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add slot card */}
          {editMode && plan.slots.length < 7 && (
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
              className="w-full py-3 border-t border-warm-300 flex items-center justify-center gap-1.5 text-warm-500 active:bg-warm-100 transition-colors"
            >
              <Plus size={16} strokeWidth={2} />
              <span className="text-xs font-medium">Lägg till en dag</span>
            </button>
          )}

          {/* Regenerate link */}
          <div className="py-4 flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="text-warm-500 text-xs font-medium flex items-center gap-1.5 active:text-warm-700 transition-colors disabled:opacity-50"
            >
              <Sparkles size={14} />
              {generating ? "Skapar ny meny..." : "Generera ny meny"}
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
