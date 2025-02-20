import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

import Loader from 'app/components/Elements/Loader';
import { arrayUtils } from 'app/Charts';
import PieChartLabel from './PieChartLabel';
import markdownDatasets from '../markdownDatasets';

export const PieChartComponent = (props) => {
  const {
    showLabel,
    outerRadius,
    innerRadius,
    property,
    data,
    classname,
    context,
    colors,
    thesauris,
    maxCategories,
  } = props;

  let output = <Loader/>;

  if (data) {
    const formattedData = arrayUtils.sortValues(
      arrayUtils.formatDataForChart(data, property, thesauris, { context, excludeZero: true, maxCategories })
    );
    const sliceColors = colors.split(',');
    const shouldShowLabel = showLabel === 'true';
    output = (
      <ResponsiveContainer width="100%" height={222}>
        <PieChart width={222} height={222}>
          <Pie
            data={formattedData}
            dataKey="results"
            nameKey="label"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            labelLine={shouldShowLabel}
            label={shouldShowLabel ? <PieChartLabel data={formattedData}/> : undefined}
          >
            {
              formattedData.map((entry, index) => <Cell key={index} fill={sliceColors[index % sliceColors.length]} />)
            }
          </Pie>
          { !shouldShowLabel && <Tooltip/> }
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return <div className={`PieChart ${classname}`}>{output}</div>;
};

PieChartComponent.defaultProps = {
  context: 'System',
  innerRadius: '0',
  outerRadius: '105',
  classname: '',
  colors: '#ffcc00,#ffd633,#ffe066,#ffeb99,#fff5cc',
  data: null,
  showLabel: 'false',
  maxCategories: '0',
};

PieChartComponent.propTypes = {
  thesauris: PropTypes.instanceOf(Immutable.List).isRequired,
  innerRadius: PropTypes.string,
  outerRadius: PropTypes.string,
  maxCategories: PropTypes.string,
  property: PropTypes.string.isRequired,
  context: PropTypes.string,
  classname: PropTypes.string,
  colors: PropTypes.string,
  showLabel: PropTypes.string,
  data: PropTypes.instanceOf(Immutable.List),
};

export const mapStateToProps = (state, props) => ({
  data: markdownDatasets.getAggregations(state, props),
  thesauris: state.thesauris,
});

export default connect(mapStateToProps)(PieChartComponent);
