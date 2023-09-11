function! docbase#buffer_action#post_new#save()
  call denops#notify("docbase", "bufferAction", [bufnr(), "save", {}])
endfunction
