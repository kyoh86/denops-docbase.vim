function! docbase#list#domains()
  call denops#request("docbase", "listDomains", [])
endfunction

function! docbase#list#posts(domain)
  call denops#request("docbase", "listPosts", [a:domain])
endfunction
