// import { type Resources } from "./signatures.js"
import * as p_ from 'pareto-core/interface/resource'

import { $$ as p_execute_command_executable } from "./commands/implementations/command_executable.js"
import { $$ as p_execute_smelly_command_executable } from "./commands/implementations/smelly_command_executable.js"
import { $$ as q_execute_query_executable } from "./queries/implementations/query_executable.js"

export const $ = {
    'commands': {
        'command executable': p_execute_command_executable,
        'smelly command executable': p_execute_smelly_command_executable,

    },
    'queries': {
        'query executable': q_execute_query_executable,
    }
} satisfies p_.Resource