function get_table(rows, cols, class_name, validatation)
{
    var id_string;
    var html;
    var row;
    var n, m;

    html = '';
    m = 0;
    while (m < rows)
    {
        n = 0;
        row = '<tr>';
        while (n < cols)
        {
            id_string = class_name + m + n;
            row += `<td><input type="text" class="${class_name}"
                    onblur="${validatation}(this)"
                    maxlength="1" id="${id_string}"/></td>`;

            //
            // console.log(row);
            //       
            ++ n;
        }
        row += '</tr>';
        html += row;
        ++ m;
    }

    return '<table>' + html + '</table>';
}

function set_table(values, size, class_name, _document)
{
    var input;
    var id;
    var m, n, count;

    count = 0;
    m = 0;

    while (m < size)
    {
        n = 0;
        while (n < size)
        {
            id = (class_name + m) + n;
            input = _document.getElementById(id);

            input.value = values[count];

            ++ n;
            ++ count;
        }
        ++ m;
    }
}

function get_button(action)
{
    return `<button onclick="${action}()">Solve</button>`;
}

function is_digit(text)
{
    return text.length == 1 && text > '0' && text <= '9';
}

function validate_input(input)
{
    // console.log(input);

    if (!is_digit(input.value))
        input.value = '';
}

function get_values(elements)
{
    var values;
    var n;
    var value;

    values = [];
    n = 0;
    while (n < elements.length)
    {
        value = elements[n].value;
        value = value == '' ? 0 : parseInt(value);
        values.push(value);
        
        ++ n;
    }

    return values;
}
