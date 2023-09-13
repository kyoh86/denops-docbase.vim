function! docbase#buffer_action#new_post()
  call denops#notify("docbase", "bufferAction", [bufnr(), "save", {}])
endfunction
