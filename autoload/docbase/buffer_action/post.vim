function! docbase#buffer_action#post#save()
  call denops#notify("docbase", "bufferAction", [bufnr(), "save", {}])
endfunction
