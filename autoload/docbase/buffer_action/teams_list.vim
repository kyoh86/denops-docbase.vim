function! docbase#buffer_action#teams_list#open(lnum, opener = "edit")
  call denops#notify("docbase", "bufferAction", [bufnr(), "open", {"lnum": a:lnum, "opener": a:opener}])
endfunction
