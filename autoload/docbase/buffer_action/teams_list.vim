function! docbase#buffer_action#teams_list#open(lnum, mods="")
  call denops#request("docbase", "router:action", [bufnr(), "open", {"lnum": a:lnum, "mods": a:mods}])
endfunction
