/**
 * Wordpress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { __ } from '@wordpress/i18n';
import { InnerBlocks, RichText } from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { applyFilters } from '@wordpress/hooks';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies
 */
import CustomBlockAppender from '../../components/custom-block-appender';
import createFilterableComponent from '../../utils/createFilterableComponent';
import { editPropsShape } from './props-shape';

const FilterableTabsItemHeader = createFilterableComponent('newspack.tabsItem.header');
const FilterableTabsItemFooter = createFilterableComponent('newspack.tabsItem.footer');

const TabsItemEdit = (props) => {
	const {
		isSelected,
		hasSelectedInnerBlock,
		setAttributes,
		clientId,
		position,
		name,
		attributes: { header },
	} = props;

	const classes = isSelected || hasSelectedInnerBlock() ? 'tab-content is-active' : 'tab-content';

	return (
		<>
			<FilterableTabsItemHeader blockProps={props} />
			<div className={classes}>
				<div
					data-tab-block={clientId}
					className={`tab-header orientation-horizontal position-${position}`}
				>
					{/* The reason we don't have the RichText field in the parent block is so that when you are editing tab header text you are selecting
					the child block. */}
					<RichText
						tagName="div"
						value={header}
						placeholder={__('Tab Header', 'publisher-media-kit')}
						onChange={(newHeader) => {
							// eslint-disable-next-line prettier/prettier
							setAttributes({ header: decodeEntities(newHeader).replace( /<\/?[a-z][^>]*?>/gi, ' ' ) });
						}}
						allowedFormats={[]}
					/>
				</div>

				<InnerBlocks
					templateInsertUpdatesSelection
					__experimentalCaptureToolbars
					allowedBlocks={applyFilters('newspack.tabs.allowedBlocks', true, name)}
					renderAppender={() => (
						<CustomBlockAppender
							className="tabs-item-appender"
							rootClientId={clientId}
							showTooltip
							label={__('Insert Tab Content', 'publisher-media-kit')}
						/>
					)}
				/>
			</div>
			<FilterableTabsItemFooter blockProps={props} />
		</>
	);
};

TabsItemEdit.propTypes = {
	...editPropsShape,
};
export default compose(
	withSelect((select, { clientId }) => {
		const { hasSelectedInnerBlock, getBlockParents, getBlock } = select('core/block-editor');

		const parentBlockIds = getBlockParents(clientId);
		const parentBlockId = parentBlockIds[parentBlockIds.length - 1];

		const parentBlock = getBlock(parentBlockId);

		let position = 0;

		parentBlock.innerBlocks.forEach((parentInnerBlock, key) => {
			if (parentInnerBlock.clientId === clientId) {
				position = key;
			}
		});

		return {
			position,
			hasSelectedInnerBlock,
		};
	}),
)(TabsItemEdit);
