function! docbase#open#teams_list(mods="")
  call denops#notify("docbase", "router:open", ["teams-list", a:mods])
endfunction

function! docbase#open#posts_list(domain, mods="")
  call denops#notify("docbase", "router:open", ["posts-list", a:mods, {"domain": a:domain}])
endfunction

function! docbase#open#post(domain, post_id, mods="")
  call denops#notify("docbase", "router:open", ["post", a:mods, {"domain": a:domain,"postId": a:post_id}])
endfunction

function! docbase#open#new_post(domain, mods="")
  call denops#notify("docbase", "router:open", ["new-post", a:mods, {"domain": a:domain}])
endfunction


