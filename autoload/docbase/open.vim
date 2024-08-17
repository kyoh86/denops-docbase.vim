function! docbase#open#teams_list(open_option={})
  call denops#notify("docbase", "router:open", ["teams-list", a:open_option])
endfunction

function! docbase#open#posts_list(domain, open_option={})
  call denops#notify("docbase", "router:open", ["posts-list", {"domain": a:domain}, "", a:open_option])
endfunction

function! docbase#open#post(domain, post_id, open_option={})
  call denops#notify("docbase", "router:open", ["post", {"domain": a:domain,"postId": a:post_id}, "", a:open_option])
endfunction

function! docbase#open#new_post(domain, open_option={})
  call denops#notify("docbase", "router:open", ["new-post", {"domain": a:domain}, "", a:open_option])
endfunction


