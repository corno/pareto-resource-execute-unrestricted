import * as p_a from 'pareto-core/implementation/refiner'
import * as p_ti from 'pareto-core/interface/transformer'

import * as d_terminal_output from "pareto-resources/interface/schemas/terminal_output"

export const Message: p_ti.Transformer<string, d_terminal_output.Message> = ($) => ({
    'raw': $,
    'lines': p_a.literal.list($.split("\n")),
})