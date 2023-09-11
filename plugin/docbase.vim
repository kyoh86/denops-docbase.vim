augroup docbase-ftdetect
autocmd! *
autocmd BufRead,BufNewFile docbase://* call denops#notify("docbase", "bufferLoaded", [bufnr()])
augroup END
