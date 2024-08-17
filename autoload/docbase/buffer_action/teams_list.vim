function! docbase#buffer_action#teams_list#open(lnum, open_option={})
  call denops#request("docbase", "router:action", [bufnr(), "open", {"lnum": a:lnum, "open_option": a:open_option}])
endfunction
