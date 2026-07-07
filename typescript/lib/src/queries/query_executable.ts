import * as p_ from 'pareto-core/implementation/resource'
import p_change_context from 'pareto-core/implementation/refiner/specials/change_context'

//interface
import * as resources from "pareto-resources/interface/resources"

//dependencies
import { spawn } from "node:child_process"
import * as t_text_to_terminal_output from "../__internal/terminal_output.js"
import * as t_path_to_text from "pareto-resources/implementation/manual/transformers/unrestricted_path/text"


/**
 * 
 * The executable being executed is assumed to be side effect free
 * There is no way to give guarantees about that though
 */
export const $$: resources.execute_unrestricted.queries.query_executable = p_.query(($p, on_value, on_error) => {
    const args = $p.args.__get_raw()

    const wd_raw = $p['working directory'].__get_raw()

    const child = spawn($p.program, args, {
        'cwd': wd_raw === null
            ? undefined
            : t_path_to_text.Context_Path(wd_raw[0]),
        shell: false, // ✅ no implicit parsing
    })

    let stdoutData = ""
    let stderrData = ""

    child.stdout.on("data", chunk => {
        stdoutData += chunk.toString("utf8")
    })

    child.stderr.on("data", chunk => {
        stderrData += chunk.toString("utf8")
    })

    child.on("error", err => {
        on_error(p_change_context(null, () => {
            if (!(err instanceof Error)) {
                throw new Error(`Expected an Error instance, got: ${typeof err}`)
            }
            return ['failed to spawn', {
                message: t_text_to_terminal_output.Message(err.message),
            }]
        }))
    })

    child.on("close", exitCode => {
        if (exitCode === 0) {
            on_value({
                'stdout': t_text_to_terminal_output.Message(stdoutData),
            })
        } else {
            on_error(p_change_context(null, () => {
                return ['non zero exit code', {
                    'exit code': exitCode === null 
                    ? p_.literal.not_set() 
                    : p_.literal.set(exitCode),
                    'stderr': t_text_to_terminal_output.Message(stderrData),
                }]
            }))
        }
    })
})