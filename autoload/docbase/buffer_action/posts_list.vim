function! docbase#buffer_action#posts_list#open(lnum, mods="")
  call denops#notify("docbase", "router:action", [bufnr(), "open", {"lnum": a:lnum, "mods": a:mods}])
endfunction

function! docbase#buffer_action#posts_list#prev()
  call denops#notify("docbase", "router:action", [bufnr(), "prev", {}])
endfunction

function! docbase#buffer_action#posts_list#next()
  call denops#notify("docbase", "router:action", [bufnr(), "next", {}])
endfunction
