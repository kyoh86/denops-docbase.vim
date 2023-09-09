augroup docbase-ftdetect
autocmd! *
autocmd BufRead,BufNewFile docbase://* call denops#notify("docbase", "loadBuffer", [bufnr(), bufname()])
augroup END
