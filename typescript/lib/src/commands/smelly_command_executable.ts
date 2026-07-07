
import * as p_ from 'pareto-core/implementation/resource'

//interface
import * as resources from "pareto-resources/interface/resources"

//dependencies
import { spawn } from "node:child_process"
import * as t_text_to_terminal_output from "../__internal/terminal_output.js"
import * as t_path_to_text from "pareto-resources/implementation/manual/transformers/unrestricted_path/text"

// import { Signature } from "pareto-resources/interface/algorithms/commands/execute_smelly_procedure_executable"


/**
 * 
 * The executable being executed is assumed to only cause side effects
 * and not return any meaningful data, std::out is therefor ignored
 */
export const $$: resources.execute_unrestricted.commands.smelly_command_executable = p_.command(($p, on_success, on_error) => {

    const wd_raw = $p['working directory'].__get_raw()

    let stderrData = ""

    let stdoutData = ""

    const child = spawn(
        $p.program,
        $p.args.__get_raw(),
        {
            'cwd': wd_raw === null
                ? undefined
                : t_path_to_text.Context_Path(wd_raw[0]),
            shell: false, // direct execution, no shell
            stdio: ['pipe', 'pipe', 'pipe'], // explicitly pipe stdin, stdout, stderr
        }
    )

    child.stdout.on("data", chunk => {
        stdoutData += chunk.toString("utf8")
    })

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
                    ? p_.literal.not_set()        //what does an exit code of null even mean?
                    : p_.literal.set(exitCode),
                'stderr': t_text_to_terminal_output.Message(stderrData),
                'stdout': t_text_to_terminal_output.Message(stdoutData),
            }])
        }
    })
})