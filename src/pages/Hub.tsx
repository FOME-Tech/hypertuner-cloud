import {
  Button,
  Grid,
  Input,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
  CopyOutlined,
  StarOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  generatePath,
  useNavigate,
} from 'react-router';
import debounce from 'lodash.debounce';
import useDb from '../hooks/useDb';
import { Routes } from '../routes';
import { buildFullUrl } from '../utils/url';
import { aspirationMapper } from '../utils/tune/mappers';
import { TuneDbDocument } from '../types/dbData';

const { useBreakpoint } = Grid;

const tunePath = (tuneId: string) => generatePath(Routes.TUNE_TUNE, { tuneId });

const Hub = () => {
  const { xs } = useBreakpoint();
  const { searchTunes } = useDb();
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<any>([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const copyToClipboard = async (shareUrl: string) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  const loadData = debounce(async (searchText?: string) => {
    setIsLoading(true);
    const list = await searchTunes(searchText);
    // TODO: create `unpublishedTunes` collection for this
    const filtered = list.documents.filter((tune) => !!tune.vehicleName);
    setDataSource(filtered.map((tune) => ({
      ...tune,
      key: tune.tuneId,
      year: tune.year,
      author: '?',
      displacement: `${tune.displacement}l`,
      aspiration: aspirationMapper[tune.aspiration],
      publishedAt: new Date(tune.$updatedAt * 1000).toLocaleString(),
      stars: 0,
    })));
    setIsLoading(false);
  }, 300);

  const debounceLoadData = useCallback((value: string) => loadData(value), [loadData]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // TODO: fix this

  const columns: ColumnsType<any> = [
    {
      title: 'Tune',
      render: (tune: TuneDbDocument) => (
        <>
          {tune.vehicleName} ({tune.signature}), published: {tune.publishedAt}
          <br />
          {tune.engineMake}, {tune.engineCode}, {tune.displacement}, {tune.cylindersCount} cylinders, {tune.aspiration}
          <br />
          author: ? 0 <StarOutlined />
        </>
      ),
      responsive: ['xs'],
    },
    {
      title: 'Vehicle name',
      dataIndex: 'vehicleName',
      key: 'vehicleName',
      responsive: ['sm'],
    },
    {
      title: 'Make',
      dataIndex: 'engineMake',
      key: 'engineMake',
      responsive: ['sm'],
    },
    {
      title: 'Engine code',
      dataIndex: 'engineCode',
      key: 'engineCode',
      responsive: ['sm'],
    },
    {
      title: '',
      dataIndex: 'displacement',
      key: 'displacement',
      responsive: ['sm'],
    },
    {
      title: 'Cylinders',
      dataIndex: 'cylindersCount',
      key: 'cylindersCount',
      responsive: ['sm'],
    },
    {
      title: 'Aspiration',
      dataIndex: 'aspiration',
      key: 'aspiration',
      responsive: ['sm'],
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      responsive: ['sm'],
    },
    {
      title: 'Signature',
      dataIndex: 'signature',
      key: 'author',
      responsive: ['sm'],
    },
    {
      title: 'Published',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      responsive: ['sm'],
    },
    {
      title: <StarOutlined />,
      dataIndex: 'stars',
      key: 'stars',
      responsive: ['sm'],
    },
    {
      dataIndex: 'tuneId',
      fixed: 'right',
      render: (tuneId: string) => (
        <Space>
          <Tooltip title={copied ? 'Copied!' : 'Copy URL'}>
            <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(buildFullUrl([tunePath(tuneId)]))} />
          </Tooltip>
          <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate(tunePath(tuneId))} />
        </Space>
      ),
      key: 'tuneId',
    },
  ];

  return (
    <div className="large-container">
      <Typography.Title>Hub</Typography.Title>
      <Input
        tabIndex={0}
        style={{ marginBottom: 10, height: 40 }}
        placeholder="Search..."
        onChange={({ target }) => debounceLoadData(target.value)}
      />
      <Table
        dataSource={dataSource}
        columns={columns}
        loading={isLoading}
        scroll={xs ? undefined : { x: 1360 }}
        pagination={false}
      />
    </div>
  );
};

export default Hub;
