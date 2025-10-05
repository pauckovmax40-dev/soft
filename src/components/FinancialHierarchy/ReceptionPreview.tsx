import React, { useState } from 'react'
import { ReceptionExcelRow } from '../../utils/parseReceptionExcel'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface ReceptionPreviewProps {
  data: ReceptionExcelRow[]
}

interface PositionItemProps {
  item: ReceptionExcelRow
}

const PositionItem: React.FC<PositionItemProps> = ({ item }) => {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{item.itemName}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-900">{item.quantity}</p>
      </div>
    </div>
  )
}

interface TransactionGroupProps {
  type: string
  items: ReceptionExcelRow[]
}

const TransactionGroup: React.FC<TransactionGroupProps> = ({ type, items }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (items.length === 0) return null

  const isIncome = type === 'Доходы'
  const textColor = isIncome ? 'text-green-600' : 'text-red-600'

  const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

  return (
    <div>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer py-1.5 px-2 hover:bg-gray-50 rounded"
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm text-gray-600">{isIncome ? '↗' : '↘'}</span>
          <h4 className={`text-sm font-medium ${textColor}`}>{type}</h4>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${textColor}`}>
            {isIncome ? '+' : '-'} {Math.abs(total).toLocaleString('ru-RU')} ₽
          </span>
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-1 space-y-1 pl-4">
          {items.map((item, idx) => (
            <PositionItem key={idx} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

interface BaseItemGroupProps {
  baseItemName: string
  items: ReceptionExcelRow[]
}

const BaseItemGroup: React.FC<BaseItemGroupProps> = ({ baseItemName, items }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const incomeItems = items.filter(item => item.transactionType === 'Доходы')
  const expenseItems = items.filter(item => item.transactionType === 'Расходы')

  const incomeTotal = incomeItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const expenseTotal = expenseItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const profit = incomeTotal + expenseTotal

  return (
    <div className="bg-blue-50 rounded-lg px-3 py-2">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer"
      >
        <h3 className="text-sm font-medium text-gray-800 flex-1">{baseItemName}</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-600 font-medium">↗ {incomeTotal.toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-blue-600 font-semibold">₽ {profit.toLocaleString('ru-RU')} ₽</span>
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-3">
          <TransactionGroup type="Доходы" items={incomeItems} />
          <TransactionGroup type="Расходы" items={expenseItems} />
        </div>
      )}
    </div>
  )
}

interface WorkGroupProps {
  workGroup: string
  items: ReceptionExcelRow[]
}

const WorkGroup: React.FC<WorkGroupProps> = ({ workGroup, items }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const baseItemMap = new Map<string, ReceptionExcelRow[]>()
  for (const item of items) {
    const baseName = item.itemName.split('_ID_')[0].trim()
    if (!baseItemMap.has(baseName)) {
      baseItemMap.set(baseName, [])
    }
    baseItemMap.get(baseName)!.push(item)
  }

  const incomeTotal = items
    .filter(item => item.transactionType === 'Доходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const expenseTotal = items
    .filter(item => item.transactionType === 'Расходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const profit = incomeTotal + expenseTotal

  return (
    <div className="border-l-4 border-blue-400 pl-3">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer py-2 px-3 hover:bg-blue-50 rounded"
      >
        <h2 className="text-sm font-medium text-gray-800 flex-1">{workGroup}</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-600 font-medium">↗ {incomeTotal.toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-blue-600 font-semibold">₽ {profit.toLocaleString('ru-RU')} ₽</span>
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-2">
          {Array.from(baseItemMap.entries()).map(([baseName, baseItems]) => (
            <BaseItemGroup
              key={baseName}
              baseItemName={baseName}
              items={baseItems}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface PositionGroupProps {
  positionNumber: number
  items: ReceptionExcelRow[]
}

const PositionGroup: React.FC<PositionGroupProps> = ({ positionNumber, items }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const firstItem = items[0]

  const workGroupMap = new Map<string, ReceptionExcelRow[]>()
  for (const item of items) {
    if (!workGroupMap.has(item.workGroup)) {
      workGroupMap.set(item.workGroup, [])
    }
    workGroupMap.get(item.workGroup)!.push(item)
  }

  const incomeTotal = items
    .filter(item => item.transactionType === 'Доходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const expenseTotal = items
    .filter(item => item.transactionType === 'Расходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const profit = incomeTotal + expenseTotal

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-t-lg cursor-pointer"
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
            {positionNumber}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{firstItem.serviceName}</h2>
            <p className="text-xs text-gray-600">{firstItem.subdivisionName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-green-600 font-medium">↗ {incomeTotal.toLocaleString('ru-RU')} ₽</span>
          <span className="text-sm text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-sm text-blue-600 font-semibold">₽ {profit.toLocaleString('ru-RU')} ₽</span>
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {Array.from(workGroupMap.entries()).map(([workGroup, workItems]) => (
            <WorkGroup
              key={workGroup}
              workGroup={workGroup}
              items={workItems}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const ReceptionPreview: React.FC<ReceptionPreviewProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Нет данных для отображения. Загрузите Excel файл.
      </div>
    )
  }

  const firstRow = data[0]

  const motorGroups = new Map<number, ReceptionExcelRow[]>()
  for (const row of data) {
    if (!motorGroups.has(row.positionNumber)) {
      motorGroups.set(row.positionNumber, [])
    }
    motorGroups.get(row.positionNumber)!.push(row)
  }

  const sortedGroups = Array.from(motorGroups.entries()).sort(
    ([a], [b]) => a - b
  )

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Информация о приемке</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Номер приемки:</span>
            <p className="font-medium">{firstRow.receptionNumber}</p>
          </div>
          <div>
            <span className="text-gray-500">Дата приемки:</span>
            <p className="font-medium">{firstRow.receptionDate}</p>
          </div>
          <div>
            <span className="text-gray-500">Контрагент:</span>
            <p className="font-medium">{firstRow.counterpartyName}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700">
          Двигатели ({sortedGroups.length})
        </h3>
        {sortedGroups.map(([positionNumber, items]) => (
          <PositionGroup
            key={positionNumber}
            positionNumber={positionNumber}
            items={items}
          />
        ))}
      </div>
    </div>
  )
}
