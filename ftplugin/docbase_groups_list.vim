nnoremap <buffer> <plug>(docbase-buffer-action-groups-list-open) <cmd>call docbase#buffer_action#groups_list#open(line("."))<cr>
nnoremap <buffer> <plug>(docbase-buffer-action-groups-list-open-new) <cmd>call docbase#buffer_action#groups_list#open(line("."), {"split": "split-above"})<cr>
nnoremap <buffer> <plug>(docbase-buffer-action-groups-list-open-vnew) <cmd>call docbase#buffer_action#groups_list#open(line("."), {"split": "split-left"})<cr>
nnoremap <buffer> <plug>(docbase-buffer-action-groups-list-open-tab) <cmd>call docbase#buffer_action#groups_list#open(line("."), {"split": "split-tab"})<cr>

nnoremap <buffer> <plug>(docbase-buffer-action-groups-list-prev) <cmd>call docbase#buffer_action#groups_list#prev()<cr>
nnoremap <buffer> <plug>(docbase-buffer-action-groups-list-next) <cmd>call docbase#buffer_action#groups_list#next()<cr>
