'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SudokuSolver, boardWithSourceToSimple, applySolutionToBoard, autoSolveCells, PublicSudokuSolver, type SudokuBoardWithSource } from '@/utils/sudokuSolver';
import { Trash2, Eye, Search } from "lucide-react";

type CellValue = string | null;
type CellSource = 'user' | 'system' | null;

interface Cell {
  value: CellValue;
  source: CellSource;
}

type Board = Cell[][];

const SudokuBoard: React.FC = () => {
  const initializeBoard = (): Board => {
    return Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => ({ value: null, source: null }))
    );
  };

  const [board, setBoard] = useState<Board>(initializeBoard());
  const [focusedCell, setFocusedCell] = useState<{row: number, col: number}>({row: 0, col: 0});
  const [errorCells, setErrorCells] = useState<Set<string>>(new Set());
  const [showCandidates, setShowCandidates] = useState<boolean>(false);
  const [cellCandidates, setCellCandidates] = useState<Map<string, string[]>>(new Map());
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array(9).fill(null).map(() => Array(9).fill(null))
  );

  const calculateCandidates = useCallback(() => {
    const simpleBoard = boardWithSourceToSimple(board);
    if (!SudokuSolver.isValidBoard(simpleBoard)) {
      setCellCandidates(new Map());
      return;
    }

    const solver = new PublicSudokuSolver(simpleBoard);
    const candidates = new Map<string, string[]>();

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j].value === null) {
          const key = `${i}-${j}`;
          const validNumbers = solver.getValidNumbers(i, j);
          candidates.set(key, validNumbers);
        }
      }
    }

    setCellCandidates(candidates);
  }, [board]);

  const autoSolveStep = useCallback(() => {
    setBoard(prev => {
      const result = autoSolveCells(prev);
      return result;
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      autoSolveStep();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [board, autoSolveStep]);

  // Atualizar candidatos quando o tabuleiro mudar e o modo estiver ativo
  useEffect(() => {
    if (showCandidates) {
      calculateCandidates();
    }
  }, [board, showCandidates, calculateCandidates]);

  // Focar na primeira célula quando o componente for montado
  useEffect(() => {
    if (inputRefs.current[0][0]) {
      inputRefs.current[0][0].focus();
    }
  }, []);

  const isValidMove = (board: Board, row: number, col: number, value: string): boolean => {
    if (!value || value === '') return true;
    
    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > 9) return false;
    
    // Verificar linha
    for (let c = 0; c < 9; c++) {
      if (c !== col && board[row][c].value === value) {
        return false;
      }
    }
    
    // Verificar coluna
    for (let r = 0; r < 9; r++) {
      if (r !== row && board[r][col].value === value) {
        return false;
      }
    }
    
    // Verificar quadrado 3x3
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if ((r !== row || c !== col) && board[r][c].value === value) {
          return false;
        }
      }
    }
    
    return true;
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    if (value === '' || /^[1-9]$/.test(value)) {
      const cellKey = `${row}-${col}`;
      
      setBoard(prev => {
        const newBoard = prev.map(r => r.map(c => ({ ...c })));
        
        // Verificar se o movimento é válido
        const isValid = isValidMove(newBoard, row, col, value);
        
        if (newBoard[row][col].source === 'system') {
          return prev; // Não permitir edição de células do sistema
        }
        
        newBoard[row][col] = {
          value: value === '' ? null : value,
          source: value === '' ? null : 'user'
        };
        
        // Atualizar estado de erro
        setErrorCells(prevErrors => {
          const newErrors = new Set(prevErrors);
          if (!isValid && value !== '') {
            newErrors.add(cellKey);
            // Remover erro após 3 segundos
            setTimeout(() => {
              setErrorCells(current => {
                const updated = new Set(current);
                updated.delete(cellKey);
                return updated;
              });
            }, 3000);
          } else {
            newErrors.delete(cellKey);
          }
          return newErrors;
        });
        
        return newBoard;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    let newRow = row;
    let newCol = col;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newRow = row > 0 ? row - 1 : 8;
        break;
      case 'ArrowDown':
        e.preventDefault();
        newRow = row < 8 ? row + 1 : 0;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newCol = col > 0 ? col - 1 : 8;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newCol = col < 8 ? col + 1 : 0;
        break;
      default:
        return;
    }

    setFocusedCell({row: newRow, col: newCol});
    inputRefs.current[newRow][newCol]?.focus();
  };

  const handleCellFocus = (row: number, col: number) => {
    setFocusedCell({row, col});
  };

  const clearBoard = () => {
    setBoard(initializeBoard());
    setCellCandidates(new Map());
    setShowCandidates(false);
  };

  const toggleCandidates = () => {
    if (!showCandidates) {
      calculateCandidates();
    }
    setShowCandidates(!showCandidates);
  };

  const getCellClassName = (cell: Cell, row: number, col: number) => {
    let baseClass = 'sudoku-cell w-14 h-14 text-center text-lg font-bold border border-slate-300 focus:outline-none transition-all duration-200';
    
    const cellKey = `${row}-${col}`;
    const hasError = errorCells.has(cellKey);
    
    // Aplicar classe de erro se necessário
    if (hasError) {
      baseClass += ' error-cell';
    }
    
    // Destacar célula focada com animação (apenas se não houver erro)
    if (focusedCell.row === row && focusedCell.col === col && !hasError) {
      baseClass += ' pulse-focus';
    }
    
    if (cell.source === 'user') {
      baseClass += hasError ? ' text-red-700' : ' text-blue-700 bg-blue-50 shadow-sm number-appear';
    } else if (cell.source === 'system') {
      baseClass += ' text-slate-600 bg-slate-100 shadow-sm blink-bg number-appear';
    } else {
      baseClass += ' text-slate-800 bg-white hover:bg-slate-50';
    }
    
    return baseClass;
  };

  const getGridClassName = (row: number, col: number) => {
    let className = '';
    
    // Bordas mais grossas para separar os quadrados 3x3
    if (row % 3 === 0 && row !== 0) className += ' border-t-3 border-t-slate-800';
    if (col % 3 === 0 && col !== 0) className += ' border-l-3 border-l-slate-800';
    if (row === 8) className += ' border-b-3 border-b-slate-800';
    if (col === 8) className += ' border-r-3 border-r-slate-800';
    if (row === 0) className += ' border-t-3 border-t-slate-800';
    if (col === 0) className += ' border-l-3 border-l-slate-800';
    
    return className;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="p-8 slide-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Sudoku</h1>
          <p className="text-slate-600 text-lg">Resolução Automática Inteligente</p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-300 to-pink-500 mx-auto mt-4 rounded-full"></div>
        </div>
        
        {/* Tabuleiro */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-9 gap-0 border-4 border-slate-800 bg-white rounded-lg overflow-hidden shadow-lg">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const cellKey = `${rowIndex}-${colIndex}`;
                const candidates = cellCandidates.get(cellKey) || [];
                const isEmpty = cell.value === null;
                
                return (
                  <div key={cellKey} className={`relative ${getGridClassName(rowIndex, colIndex)}`}>
                    <input
                      ref={(el) => {
                        if (inputRefs.current[rowIndex]) {
                          inputRefs.current[rowIndex][colIndex] = el;
                        }
                      }}
                      type="text"
                      maxLength={1}
                      value={cell.value || ''}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                      onFocus={() => handleCellFocus(rowIndex, colIndex)}
                      className={`${getCellClassName(cell, rowIndex, colIndex)} ${showCandidates && isEmpty ? 'opacity-30' : ''}`}
                      disabled={false}
                    />
                    {showCandidates && isEmpty && candidates.length > 0 && (
                      <div className="absolute inset-0 pointer-events-none flex flex-wrap justify-center items-center p-1">
                        <div className="grid grid-cols-3 gap-0 w-full h-full text-xs">
                          {[1,2,3,4,5,6,7,8,9].map(num => {
                            const numStr = num.toString();
                            const isCandidate = candidates.includes(numStr);
                            return (
                              <div 
                                key={num} 
                                className={`flex items-center justify-center text-xs font-medium ${
                                  isCandidate ? 'text-blue-600' : 'text-transparent'
                                }`}
                              >
                                {isCandidate ? numStr : ''}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={clearBoard}
              className="
                flex items-center gap-2
                px-6 py-3
                rounded-2xl
                bg-gradient-to-r from-slate-600 to-slate-700
                text-white font-semibold
                shadow-md
                hover:from-slate-700 hover:to-slate-800
                hover:shadow-lg 
                active:scale-95
                transition-all duration-200
                button-hover slide-in
              "
            >
              <Trash2 className="w-5 h-5" />
              Limpar Tabuleiro
            </button>
            
            <button
              onClick={toggleCandidates}
              className={`
                flex items-center gap-2
                px-6 py-3 
                rounded-xl 
                font-semibold 
                shadow-lg 
                hover:shadow-xl 
                slide-in 
                transition-all 
                duration-300
                button-hover ${
                showCandidates 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800' 
                  : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
              }`}
            >
              {showCandidates ? (
                <>
                  <Eye className="w-5 h-5" />
                  Ocultar Candidatos
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Mostrar Candidatos
                </>
              )}
            </button>
          </div>
          
          <div className="text-center">
            {showCandidates && (
              <p className="text-sm text-slate-600 max-w-md">
                Os números pequenos em azul mostram todas as possibilidades válidas para cada célula vazia.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SudokuBoard;