import * as p_ from 'pareto-core/implementation/resource'
import * as p_c from 'pareto-core/implementation/command'

//interface
import * as interface_ from "pareto-resources/interface/commands"

//dependencies
import { spawn } from "node:child_process"
import * as t_text_to_terminal_output from "../__internal/terminal_output.js"
import * as t_path_to_text from "pareto-resources/implementation/transformers/unrestricted_path/text"

/**
 * 
 * The executable being executed is assumed to only cause side effects
 * and not return any meaningful data, std::out is therefor ignored
 */
export const $$: interface_.execute_unrestricted.command_executable = p_.command(($p, on_success, on_error) => {

    const wd_raw = $p['working directory'].__get_raw()

    const child = spawn(
        $p.program,
        $p.args.__get_raw(),
        {
            'cwd': wd_raw === null
                ? undefined
                : t_path_to_text.Context_Path(wd_raw[0]),
            'shell': false,
        }
    )

    let stderrData = ""

    child.stderr.on("data", chunk => {
        stderrData += chunk.toString("utf8")
    })

    child.on("error", err => {
        on_error(['failed to spawn', { message: t_text_to_terminal_output.Message(err.message) }])
    })

    child.on("close", exitCode => {
        if (exitCode === 0) {
            on_success()
        } else {
            on_error(['non zero exit code', {
                'exit code': exitCode === null 
                ? p_c.literal.not_set()
                 : p_c.literal.set(exitCode),
                'stderr': t_text_to_terminal_output.Message(stderrData),
            }])
        }
    })
})