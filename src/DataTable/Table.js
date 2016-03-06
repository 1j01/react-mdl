import React, { PropTypes } from 'react';
import classNames from 'classnames';
import clamp from 'clamp';
import shadows from '../utils/shadows';
import Checkbox from '../Checkbox';
import TableHeader from './TableHeader';

class Table extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        columns: (props, propName, componentName) => {
            if(props[propName]) {
                return new Error(`${componentName}: \`${propName}\` is deprecated, please use the component \`TableHeader\` instead.`);
            }
        },
        data: (props, propName, componentName) => {
            if(props[propName]) {
                return new Error(`${componentName}: \`${propName}\` is deprecated, please use \`rows\` instead. \`${propName}\` will be removed in the next major release.`);
            }
        },
        onSelectionChanged: PropTypes.func,
        rows: PropTypes.arrayOf(
            PropTypes.object
        ).isRequired,
        selectable: PropTypes.bool,
        shadow: PropTypes.number
    };

    static defaultProps = {
        onSelectionChanged: () => {
            // do nothing
        }
    };

    constructor(props) {
        super(props);

        this.handleChangeHeaderCheckbox = this.handleChangeHeaderCheckbox.bind(this);
        this.handleChangeDataCheckbox = this.handleChangeDataCheckbox.bind(this);

        this.state = {
            rows: (props.rows || props.data).slice(),
            headerSelected: false,
            selectedRows: []
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            rows: (nextProps.rows || nextProps.data).slice()
        });
    }

    handleChangeHeaderCheckbox(e) {
        const selected = e.target.checked;
        let selectedRows = [];

        if(selected) {
            selectedRows = this.state.rows.map((row, idx) =>
                row.key ? row.key : idx
            );
        }

        this.setState({
            headerSelected: selected,
            selectedRows
        });

        this.props.onSelectionChanged(selectedRows);
    }

    handleChangeDataCheckbox(e) {
        const previousState = this.state;
        const rowId = parseInt(e.target.dataset.rowId, 10);
        const rowChecked = e.target.checked;
        const selectedRows = previousState.selectedRows;

        if(rowChecked) {
            selectedRows.push(rowId);
        }
        else {
            const idx = selectedRows.indexOf(rowId);
            selectedRows.splice(idx, 1);
        }

        this.setState({
            headerSelected: this.state.rows.length === selectedRows.length,
            selectedRows
        });

        this.props.onSelectionChanged(selectedRows);
    }

    renderCell(column, row) {
        const className = !column.numeric ? 'mdl-data-table__cell--non-numeric' : '';
        return (
            <td key={column.name} className={className}>
                {column.cellFormatter ? column.cellFormatter(row[column.name]) : row[column.name]}
            </td>
        );
    }

    render() {
        const { className, columns,
            selectable, shadow, children, ...otherProps } = this.props;
        const { rows, headerSelected, selectedRows } = this.state;

        const hasShadow = typeof shadow !== 'undefined';
        const shadowLevel = clamp(shadow || 0, 0, shadows.length - 1);

        const classes = classNames('mdl-data-table', {
            [shadows[shadowLevel]]: hasShadow
        }, className);

        const columnChildren = !!children
            ? React.Children.toArray(children)
            : columns.map(column =>
                <TableHeader
                    key={column.name}
                    className={column.className}
                    name={column.name}
                    numeric={column.numeric}
                    tooltip={column.tooltip}
                >
                    {column.label}
                </TableHeader>
            );
        return (
            <table className={classes} {...otherProps}>
                <thead>
                    <tr>
                        {selectable ? (
                            <th>
                                <Checkbox className="mdl-data-table__select" checked={headerSelected} onChange={this.handleChangeHeaderCheckbox} />
                            </th>
                        ) : null}
                        {columnChildren}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => {
                        const isSelected = selectedRows.indexOf(idx) > -1;
                        const rowClasses = classNames({
                            'is-selected': isSelected
                        }, row.className);
                        const rowKey = row.key ? row.key : idx;
                        return (
                            <tr key={rowKey} className={rowClasses}>
                                {selectable ? (
                                    <td>
                                        <Checkbox className="mdl-data-table__select" data-row-id={rowKey} checked={isSelected} onChange={this.handleChangeDataCheckbox} />
                                    </td>
                                ) : null}
                                {columnChildren.map((child) => this.renderCell(child.props, row))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }
}

export default Table;
