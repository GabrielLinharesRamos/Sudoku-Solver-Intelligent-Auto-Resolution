export type SudokuBoard = (string | null)[][];

export interface SudokuCell {
  value: string | null;
  source: 'user' | 'system' | null;
}

export type SudokuBoardWithSource = SudokuCell[][];

export class SudokuSolver {
  private board: SudokuBoard;
  private _rows: Set<string>[];
  private _cols: Set<string>[];
  private _squares: Set<string>[];

  constructor(board: SudokuBoard) {
    this.board = board.map(row => [...row]);
    this._rows = Array(9).fill(null).map(() => new Set<string>());
    this._cols = Array(9).fill(null).map(() => new Set<string>());
    this._squares = Array(9).fill(null).map(() => new Set<string>());
    
    this.initializeConstraints();
  }

  private initializeConstraints(): void {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.board[i][j] !== null) {
          const num = this.board[i][j]!;
          this._rows[i].add(num);
          this._cols[j].add(num);
          this._squares[this.getSquareIndex(i, j)].add(num);
        }
      }
    }
  }

  protected getSquareIndex(row: number, col: number): number {
    return Math.floor(row / 3) * 3 + Math.floor(col / 3);
  }

  protected getValidNumbers(row: number, col: number): string[] {
    const used = new Set([
      ...this._rows[row],
      ...this._cols[col],
      ...this._squares[this.getSquareIndex(row, col)]
    ]);
    
    return ['1','2','3','4','5','6','7','8','9'].filter(num => !used.has(num));
  }

  private findBestCell(): { row: number; col: number; options: string[] } | null {
    let bestCell = null;
    let minOptions = 10;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.board[i][j] === null) {
          const options = this.getValidNumbers(i, j);
          if (options.length < minOptions) {
            minOptions = options.length;
            bestCell = { row: i, col: j, options };
            if (minOptions === 1) return bestCell;
          }
        }
      }
    }

    return bestCell;
  }

  private backtrack(): boolean {
    const target = this.findBestCell();
    if (!target) return true; // resolvido

    const { row, col, options } = target;

    for (const num of options) {
      this.board[row][col] = num;
      this._rows[row].add(num);
      this._cols[col].add(num);
      this._squares[this.getSquareIndex(row, col)].add(num);

      if (this.backtrack()) return true;

      // desfaz a jogada
      this.board[row][col] = null;
      this._rows[row].delete(num);
      this._cols[col].delete(num);
      this._squares[this.getSquareIndex(row, col)].delete(num);
    }

    return false;
  }

  public solve(): SudokuBoard | null {
    if (this.backtrack()) return this.board;
    return null;
  }

  public static isValidBoard(board: SudokuBoard): boolean {
    const rows = Array(9).fill(null).map(() => new Set<string>());
    const cols = Array(9).fill(null).map(() => new Set<string>());
    const squares = Array(9).fill(null).map(() => new Set<string>());

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const num = board[i][j];
        if (num !== null) {
          const squareIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);
          if (rows[i].has(num) || cols[j].has(num) || squares[squareIndex].has(num)) return false;

          rows[i].add(num);
          cols[j].add(num);
          squares[squareIndex].add(num);
        }
      }
    }

    return true;
  }
}

export function boardWithSourceToSimple(board: SudokuBoardWithSource): SudokuBoard {
  return board.map(row => row.map(cell => cell.value));
}

export function applySolutionToBoard(
  originalBoard: SudokuBoardWithSource,
  solution: SudokuBoard
): SudokuBoardWithSource {
  return originalBoard.map((row, i) =>
    row.map((cell, j) => {
      if (cell.value === null && solution[i][j] !== null) {
        return { value: solution[i][j], source: 'system' as const };
      }
      return cell;
    })
  );
}

export function autoSolveCells(board: SudokuBoardWithSource): SudokuBoardWithSource {
  const simpleBoard = boardWithSourceToSimple(board);
  if (!SudokuSolver.isValidBoard(simpleBoard)) return board;

  const solver = new PublicSudokuSolver(simpleBoard);
  let hasChanges = false;
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  
  // Sistema de candidatos: mapa de possibilidades para cada célula vazia
  const candidates = new Map<string, Set<string>>();
  
  // Inicializar candidatos para todas as células vazias
  const initializeCandidates = () => {
    candidates.clear();
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (newBoard[i][j].value === null) {
          const key = `${i}-${j}`;
          const validNumbers = solver.getValidNumbers(i, j);
          candidates.set(key, new Set(validNumbers));
        }
      }
    }
  };
  
  // Remover candidato de uma célula específica
  const removeCandidate = (row: number, col: number, num: string): boolean => {
    const key = `${row}-${col}`;
    const cellCandidates = candidates.get(key);
    if (cellCandidates && cellCandidates.has(num)) {
      cellCandidates.delete(num);
      return true;
    }
    return false;
  };
  
  initializeCandidates();
  
  // Loop principal para aplicar técnicas repetidamente até não haver mais mudanças
  let iterationChanges = true;
  let maxIterations = 10; // Prevenir loops infinitos
  
  while (iterationChanges && maxIterations > 0) {
    iterationChanges = false;
    maxIterations--;

    // Função auxiliar para atualizar célula e estruturas do solver
    const updateCell = (row: number, col: number, value: string) => {
      newBoard[row][col] = { value, source: 'system' };
      hasChanges = true;
      iterationChanges = true;
      solver.setBoardCell(row, col, value);
      solver.getRows()[row].add(value);
      solver.getCols()[col].add(value);
      solver.getSquares()[solver.getSquareIndex(row, col)].add(value);
      
      // Remover candidatos da célula preenchida
      candidates.delete(`${row}-${col}`);
      
      // Remover este número como candidato de todas as células da mesma linha, coluna e quadrado
      const squareIndex = solver.getSquareIndex(row, col);
      const startRow = Math.floor(squareIndex / 3) * 3;
      const startCol = (squareIndex % 3) * 3;
      
      for (let i = 0; i < 9; i++) {
        // Remover da linha
        removeCandidate(row, i, value);
        // Remover da coluna
        removeCandidate(i, col, value);
      }
      
      // Remover do quadrado 3x3
      for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
          removeCandidate(r, c, value);
        }
      }
    };

  // Técnica 1: Naked Singles (célula com apenas uma possibilidade)
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (newBoard[i][j].value === null) {
        const key = `${i}-${j}`;
        const cellCandidates = candidates.get(key);
        if (cellCandidates && cellCandidates.size === 1) {
          const value = Array.from(cellCandidates)[0];
          updateCell(i, j, value);
        }
      }
    }
  }

  // Técnica 2: Hidden Singles (número único em linha, coluna ou quadrado)
  // Verificar linhas
  for (let row = 0; row < 9; row++) {
    for (const num of ['1','2','3','4','5','6','7','8','9']) {
      if (solver.getRows()[row].has(num)) continue;
      
      const possibleCols = [];
      for (let col = 0; col < 9; col++) {
        if (newBoard[row][col].value === null) {
          const key = `${row}-${col}`;
          const cellCandidates = candidates.get(key);
          if (cellCandidates && cellCandidates.has(num)) {
            possibleCols.push(col);
          }
        }
      }
      
      if (possibleCols.length === 1) {
        updateCell(row, possibleCols[0], num);
      }
    }
  }

  // Verificar colunas
  for (let col = 0; col < 9; col++) {
    for (const num of ['1','2','3','4','5','6','7','8','9']) {
      if (solver.getCols()[col].has(num)) continue;
      
      const possibleRows = [];
      for (let row = 0; row < 9; row++) {
        if (newBoard[row][col].value === null) {
          const key = `${row}-${col}`;
          const cellCandidates = candidates.get(key);
          if (cellCandidates && cellCandidates.has(num)) {
            possibleRows.push(row);
          }
        }
      }
      
      if (possibleRows.length === 1) {
        updateCell(possibleRows[0], col, num);
      }
    }
  }

  // Verificar quadrados 3x3
  for (let squareIndex = 0; squareIndex < 9; squareIndex++) {
    const startRow = Math.floor(squareIndex / 3) * 3;
    const startCol = (squareIndex % 3) * 3;
    
    for (const num of ['1','2','3','4','5','6','7','8','9']) {
      if (solver.getSquares()[squareIndex].has(num)) continue;
      
      const possibleCells = [];
      for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
          if (newBoard[r][c].value === null) {
            const key = `${r}-${c}`;
            const cellCandidates = candidates.get(key);
            if (cellCandidates && cellCandidates.has(num)) {
              possibleCells.push({ row: r, col: c });
            }
          }
        }
      }
      
      if (possibleCells.length === 1) {
        const { row, col } = possibleCells[0];
        updateCell(row, col, num);
      }
    }
  }

    // Técnica 3: Box/Line Reduction (Pointing Pairs/Triples)
    // Se um número só pode aparecer em uma linha específica dentro de um quadrado 3x3,
    // elimine esse número das outras células da mesma linha fora do quadrado
    
    for (let squareIndex = 0; squareIndex < 9; squareIndex++) {
      const startRow = Math.floor(squareIndex / 3) * 3;
      const startCol = (squareIndex % 3) * 3;
      
      for (const num of ['1','2','3','4','5','6','7','8','9']) {
        if (solver.getSquares()[squareIndex].has(num)) continue;
        
        // Verificar se o número só pode aparecer em uma linha específica do quadrado
        const rowsWithPossibility = new Set<number>();
        for (let r = startRow; r < startRow + 3; r++) {
          for (let c = startCol; c < startCol + 3; c++) {
            if (newBoard[r][c].value === null) {
              const key = `${r}-${c}`;
              const cellCandidates = candidates.get(key);
              if (cellCandidates && cellCandidates.has(num)) {
                rowsWithPossibility.add(r);
              }
            }
          }
        }
        
        // Se o número só pode aparecer em uma linha do quadrado,
        // remova as possibilidades dessa linha fora do quadrado
        if (rowsWithPossibility.size === 1) {
          const targetRow = Array.from(rowsWithPossibility)[0];
          for (let col = 0; col < 9; col++) {
            // Pular células que estão dentro do quadrado atual
            if (col >= startCol && col < startCol + 3) continue;
            
            if (newBoard[targetRow][col].value === null) {
              if (removeCandidate(targetRow, col, num)) {
                iterationChanges = true;
                hasChanges = true;
              }
            }
          }
        }
        
        // Verificar se o número só pode aparecer em uma coluna específica do quadrado
        const colsWithPossibility = new Set<number>();
        for (let r = startRow; r < startRow + 3; r++) {
          for (let c = startCol; c < startCol + 3; c++) {
            if (newBoard[r][c].value === null) {
              const key = `${r}-${c}`;
              const cellCandidates = candidates.get(key);
              if (cellCandidates && cellCandidates.has(num)) {
                colsWithPossibility.add(c);
              }
            }
          }
        }
        
        // Se o número só pode aparecer em uma coluna do quadrado,
        // remova as possibilidades dessa coluna fora do quadrado
        if (colsWithPossibility.size === 1) {
          const targetCol = Array.from(colsWithPossibility)[0];
          for (let row = 0; row < 9; row++) {
            // Pular células que estão dentro do quadrado atual
            if (row >= startRow && row < startRow + 3) continue;
            
            if (newBoard[row][targetCol].value === null) {
              if (removeCandidate(row, targetCol, num)) {
                iterationChanges = true;
                hasChanges = true;
              }
            }
          }
        }
      }
    }
  }

  return hasChanges ? newBoard : board;
}

// Subclasse pública
export class PublicSudokuSolver extends SudokuSolver {
  public getValidNumbers(row: number, col: number): string[] {
    return super['getValidNumbers'](row, col);
  }

  public getSquareIndex(row: number, col: number): number {
    return super['getSquareIndex'](row, col);
  }

  public getBoard(): SudokuBoard {
    return super['board'];
  }

  public setBoardCell(row: number, col: number, value: string | null): void {
    const board = this['board'] as SudokuBoard;
    if (board && board[row] && typeof board[row][col] !== 'undefined') {
      board[row][col] = value;
    }
  }

  // Novos getters para acessar os Sets corretamente
  public getRows(): Set<string>[] {
    return this._rows;
  }

  public getCols(): Set<string>[] {
    return this._cols;
  }

  public getSquares(): Set<string>[] {
    return this._squares;
  }
}

