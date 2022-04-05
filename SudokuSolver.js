class SudokuSolver
{
    static size;
    static block_size;
    static max_value;

    constructor (size)
    {
        this.size = size;
        this.block_size = Math.sqrt(size);
        this.max_value = Math.pow(2, size + 1) - 2;
    }

    IndexToCoordinates(index)
    {
        var x;
        var y;

        x = Math.floor(index / this.size);
        y = index % this.size;

        return [x, y];
    }

    CoordinatesToIndex(x, y)
    {
        return x * this.size + y;
    }

    CoordinatesToBlockIndex(x, y)
    {
        return Math.floor(x / this.block_size) * this.block_size + Math.floor(y / this.block_size);
    }

    BlockIndexToCoordinates(index)
    {
        var row_index;
        var col_index;

        row_index = Math.floor(index / this.block_size) * this.block_size;
        col_index = (index % this.block_size) * this.block_size;

        return [row_index, col_index];
    }

    At(board, x, y)
    {
        var index;

        index = this.CoordinatesToIndex(x, y);

        return board[index];
    }

    Set(board, x, y, value)
    {
        var index;

        index = this.CoordinatesToIndex(x, y);
        board[index] = value;

        return board;
    }

    CopyBoard(board)
    {
        return board.slice();
    }

    SelectRow(board, index)
    {
        var row;
        var n;

        row = [];
        n = 0;

        while (n < this.size)
        {
            row.push(this.At(board, index, n));
            ++ n;
        }

        return row;
    }

    SelectCol(board, index)
    {
        var n;
        var col;

        col = [];
        n = 0;

        while (n < this.size)
        {
            col.push(this.At(board, n, index));
            ++ n;
        }

        return col;
    }

    SelectBlock(board, index)
    {
        var block;
        var top_corner;
        var x, y;
        var last_x, last_y;

        top_corner = this.BlockIndexToCoordinates(index);
        block = [];
        x = top_corner[0];
        y = top_corner[1];
        last_x = x + this.block_size;
        last_y = y + this.block_size;

        while (x < last_x)
        {
            y = top_corner[1];
            while (y < last_y)
            {
                block.push(this.At(board, x, y));
                ++ y;
            }
            ++ x;
        }

        return block;
    }

    CheckRow(board, index)
    {
        return this.GetStatus(this.SelectRow(board, index));
    }

    CheckCol(board, index)
    {
        return this.GetStatus(this.SelectCol(board, index));
    }

    CheckBlock(board, index)
    {
        return this.GetStatus(this.SelectBlock(board, index));
    }

    #validate(board, selector)
    {
        var n;
        var subset;
        
        n = 0;
        while (n < this.size)
        {
            subset = this[selector](board, n);
            if (this.GetStatus(subset) < 0)
                return -1;
            ++ n;
        }

        return 0;
    }

    Validate(board)
    {
        if (this.#validate(board, 'SelectRow') < 0)
            return -1;
        
        if (this.#validate(board, 'SelectCol') < 0)
            return -1;
        
        if (this.#validate(board, 'SelectBlock') < 0)
            return -1;
        
        return 1;
    }

    #get_next_unused_bit(integer)
    {
        var bit;
        var n;

        n = 1;
        bit = 2;
        while (bit < this.max_value)
        {
            if ((bit & integer) == 0)
                return n;
            
            bit = bit << 1;
            ++ n;
        }

        return -1;
    }

    GetNextValue(board, x, y, used_values)
    {
        var status;
        var row_status;
        var col_status;
        var block_status;

        status = 0;
        row_status = this.CheckRow(board, x);
        col_status = this.CheckCol(board, y);
        block_status = this.CheckBlock(board, this.CoordinatesToBlockIndex(x, y));
        status |= row_status;
        status |= col_status;
        status |= block_status;
        status |= used_values;

        return this.#get_next_unused_bit(status);
    }

    #check_bit(integer, n)
    {
        return integer & (1 << n);
    }

    #set_bit(integer, n)
    {
        return integer | (1 << n);
    }

    GetStatus(values)
    {
        var status;
        var value;
        var n;

        status = 0;
        n = 0;
        while (n < values.length)
        {
            value = values[n];
            if (value != 0)
            {
                if (this.#check_bit(status, value))
                    return -1;
                status = this.#set_bit(status, value);
            }

            ++ n;
        }

        return status;
    }

    CountZeroes(values)
    {
        return values.reduce((previous, current) => previous + (current == 0 ? 1 : 0), 0);
    }

    #find_best(board, selector)
    {
        var subset;
        var n_zeroes;
        var min_zeroes;
        var min_index;
        var n;

        min_index = -1;
        min_zeroes = this.size + 1;
        n = 0;

        while (n < this.size)
        {
            subset = this[selector](board, n);
            n_zeroes = this.CountZeroes(subset);

            if (n_zeroes == 0)
            {
                ++ n;
                continue ;
            }

            if (n_zeroes == 1)
                return [n, n_zeroes];
            
            if (n_zeroes < min_zeroes)
            {
                min_index = n;
                min_zeroes = n_zeroes;
            }

            ++ n;
        }

        return [min_index, min_zeroes];
    }

    #find_best_row(board)
    {
        return this.#find_best(board, 'SelectRow');
    }

    #find_best_col(board)
    {
        return this.#find_best(board, 'SelectCol');
    }

    #find_best_block(board)
    {
        return this.#find_best(board, 'SelectBlock');
    }

    #find_pivot_col_in_row(board, row_index)
    {
        var row;

        row = this.SelectRow(board, row_index);

        return row.indexOf(0);
    }

    #find_pivot_row_in_col(board, col_index)
    {
        var col;

        col = this.SelectCol(board, col_index);

        return col.indexOf(0);
    }

    #find_pivot_in_block(board, block_index)
    {
        var block;
        var index;
        var top_corner;

        block = this.SelectBlock(board, block_index);
        index = block.indexOf(0);
        top_corner = this.BlockIndexToCoordinates(block_index);

        return [top_corner[0] + Math.floor(index / this.block_size),
                top_corner[1] + index % this.block_size];
    }

    FindPivot(board)
    {
        var best_row;
        var best_col;
        var best_block;
        var result;

        best_row = this.#find_best_row(board);
        best_col = this.#find_best_col(board);
        best_block = this.#find_best_block(board);

        if (best_row[0] < 0)
            return [-1, -1];

        result = MinIndex([best_row, best_col, best_block], BracketCompare);

        if (result == 0)
            return [best_row[0], this.#find_pivot_col_in_row(board, best_row[0])];
        
        if (result == 1)
            return [this.#find_pivot_row_in_col(board, best_col[0]), best_col[0]];
        
        return this.#find_pivot_in_block(board, best_block[0]);
    }

    Solve(board)
    {
        var pivot;
        var value;
        var used_values;
        var board_copy;
        var solved_board;

        // this.Display(board);
        //
        pivot = this.FindPivot(board);

        if (pivot[0] < 0)
            return board;
 
        used_values = 0;
        while (used_values < this.max_value)
        {
            value = this.GetNextValue(board, pivot[0], pivot[1], used_values);

            if (value <= 0)
                return null;
            
            board_copy = this.CopyBoard(board);
            used_values = this.#set_bit(used_values, value);
            board_copy = this.Set(board_copy, pivot[0], pivot[1], value);

            solved_board = this.Solve(board_copy);

            if (solved_board)
                return solved_board;
        }
    
        return null;
    }

    Display(board)
    {
        var n;
        var row;

        n = 0;
        while (n < this.size)
        {
            row = this.SelectRow(board, n);
            console.log(row);
            ++ n;
        }
        console.log("-----------------");
    }
}

function BracketCompare(lhs, rhs)
{
    return lhs[1] > rhs[1] ? -1 : lhs[1] < rhs[1];
}

function MinIndex(array, compare)
{
    var index;

    if (array.length == 0)
        throw "";
    
    if (array.length == 1)
        return 0;
    
    index = MinIndex(array.slice(1), compare);

    return compare(array[0], array[index + 1]) > 0 ? 0 : index + 1;
}