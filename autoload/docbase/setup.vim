function! docbase#setup#commands()
  call denops#request('docbase', 'router:setup:command', ['teams-list'])
  call denops#request('docbase', 'router:setup:command', ['teams-list', 'Docbase'])
  call denops#request('docbase', 'router:setup:command', ['posts-list'])
  call denops#request('docbase', 'router:setup:command', ['post'])
  call denops#request('docbase', 'router:setup:command', ['new-post'])
  command! DocbaseLogin call docbase#login()

  augroup docbase-setup-commands
    autocmd!
    autocmd Filetype docbase_teams_list command! <buffer> DocbaseOpenTeam  call docbase#buffer_action#teams_list#open(line("."), <q-mods>)

    autocmd Filetype docbase_posts_list command! DocbaseOpenPost           call docbase#buffer_action#posts_list#open(line("."), <q-mods>)
    autocmd Filetype docbase_posts_list command! DocbasePrevPage           call docbase#buffer_action#posts_list#prev()
    autocmd Filetype docbase_posts_list command! DocbaseNextPage           call docbase#buffer_action#posts_list#next()
  augroup END
endfunction

function! docbase#setup#maps()
  augroup docbase-setup-maps
    autocmd!
    autocmd Filetype docbase_teams_list nnoremap <buffer> <cr>  <plug>(docbase-buffer-action-teams-list-open) 
    autocmd Filetype docbase_teams_list nnoremap <buffer> <c-h> <plug>(docbase-buffer-action-teams-list-open-new) 
    autocmd Filetype docbase_teams_list nnoremap <buffer> <c-v> <plug>(docbase-buffer-action-teams-list-open-vnew) 
    autocmd Filetype docbase_teams_list nnoremap <buffer> <c-t> <plug>(docbase-buffer-action-teams-list-open-tabedit) 
    
    autocmd Filetype docbase_posts_list nnoremap <buffer> <cr>  <plug>(docbase-buffer-action-posts-list-open) 
    autocmd Filetype docbase_posts_list nnoremap <buffer> <c-h> <plug>(docbase-buffer-action-posts-list-open-new) 
    autocmd Filetype docbase_posts_list nnoremap <buffer> <c-v> <plug>(docbase-buffer-action-posts-list-open-vnew) 
    autocmd Filetype docbase_posts_list nnoremap <buffer> <c-t> <plug>(docbase-buffer-action-posts-list-open-tabedit) 
    
    autocmd Filetype docbase_posts_list nnoremap <buffer> <c-k> <plug>(docbase-buffer-action-posts-list-prev) 
    autocmd Filetype docbase_posts_list nnoremap <buffer> <c-j> <plug>(docbase-buffer-action-posts-list-next) 
  augroup END
endfunction
