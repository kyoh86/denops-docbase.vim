function! docbase#buffer_action#posts_list#open(lnum, open_option={})
  call denops#request("docbase", "router:action", [bufnr(), "open", {"lnum": a:lnum, "open_option": a:open_option}])
endfunction

function! docbase#buffer_action#posts_list#prev()
  call denops#request("docbase", "router:action", [bufnr(), "prev", {}])
endfunction

function! docbase#buffer_action#posts_list#next()
  call denops#request("docbase", "router:action", [bufnr(), "next", {}])
endfunction
