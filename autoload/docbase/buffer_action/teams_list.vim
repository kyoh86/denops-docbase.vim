function! docbase#buffer_action#teams_list#open(lnum, mods="")
  call denops#notify("docbase", "bufferAction", [bufnr(), "open", {"lnum": a:lnum, "mods": a:mods}])
endfunction
