nnoremap <buffer> <plug>(docbase-buffer-action-teams-list-open) <cmd>call docbase#buffer_action#teams_list#open(line("."), "")<cr>
nnoremap <buffer> <plug>(docbase-buffer-action-teams-list-open-new) <cmd>call docbase#buffer_action#teams_list#open(line("."), "horizontal")<cr>
nnoremap <buffer> <plug>(docbase-buffer-action-teams-list-open-vnew) <cmd>call docbase#buffer_action#teams_list#open(line("."), "vertical")<cr>
nnoremap <buffer> <plug>(docbase-buffer-action-teams-list-open-tabedit) <cmd>call docbase#buffer_action#teams_list#open(line("."), "tab")<cr>
