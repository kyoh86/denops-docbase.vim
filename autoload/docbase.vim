function! docbase#login()
  call denops#notify("docbase", "login", [])
endfunction

function! s:docbase_edit_post(mods, ...) abort
  call execute(a:mods .. " new docbase://teams/" .. a:1 .. "/posts/" .. a:2)
endfunction
