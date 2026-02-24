import { useState, useCallback, useEffect } from 'react';
import type { Command, UndoRedoState } from '@/types';

export interface UseUndoRedoReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  execute: (command: Command) => void;
  clear: () => void;
  historyLength: number;
  futureLength: number;
}

/**
 * Hook for managing undo/redo history using the Command pattern.
 * Commands must implement execute() and undo() methods.
 *
 * @param maxHistorySize - Maximum number of commands to keep in history (default: 50)
 * @returns Undo/redo controls and state
 */
export function useUndoRedo(maxHistorySize: number = 50): UseUndoRedoReturn {
  const [state, setState] = useState<UndoRedoState>({
    past: [],
    future: [],
    maxHistorySize,
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  /**
   * Execute a command and add it to history.
   * Clears the future stack (redo history).
   */
  const execute = useCallback((command: Command) => {
    // Execute the command
    command.execute();

    // Add to history
    setState((prev) => {
      const newPast = [...prev.past, command];

      // Trim history if it exceeds max size
      if (newPast.length > prev.maxHistorySize) {
        newPast.shift();
      }

      return {
        ...prev,
        past: newPast,
        future: [], // Clear redo stack
      };
    });
  }, []);

  /**
   * Undo the last command.
   * Moves the command from past to future stack.
   */
  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = [...prev.past];
      const command = newPast.pop()!;

      // Undo the command
      command.undo();

      return {
        ...prev,
        past: newPast,
        future: [command, ...prev.future],
      };
    });
  }, []);

  /**
   * Redo the last undone command.
   * Moves the command from future to past stack.
   */
  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.future.length === 0) return prev;

      const newFuture = [...prev.future];
      const command = newFuture.shift()!;

      // Re-execute the command
      command.execute();

      return {
        ...prev,
        past: [...prev.past, command],
        future: newFuture,
      };
    });
  }, []);

  /**
   * Clear all history.
   */
  const clear = useCallback(() => {
    setState((prev) => ({
      ...prev,
      past: [],
      future: [],
    }));
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z (undo) or Ctrl+Y (redo)
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    execute,
    clear,
    historyLength: state.past.length,
    futureLength: state.future.length,
  };
}

/**
 * Helper function to create a command object.
 */
export function createCommand(
  type: Command['type'],
  executeFn: () => void,
  undoFn: () => void,
  description: string
): Command {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    execute: executeFn,
    undo: undoFn,
    description,
    timestamp: Date.now(),
  };
}

export default useUndoRedo;
