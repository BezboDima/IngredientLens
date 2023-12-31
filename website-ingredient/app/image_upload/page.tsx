'use client'
import { Listbox, ListboxItem } from '@nextui-org/listbox'
import { useState } from 'react'
import { callPostGatewayApi, callPostLambda } from '../../src/request'
import { getBase64, getHashKey } from '../../src/generators'
import { Image } from '@nextui-org/image'
import { Button } from '@nextui-org/button'
import { Card, CardBody } from '@nextui-org/card'
import { Accordion, AccordionItem } from '@nextui-org/accordion'
import { Progress } from '@nextui-org/progress'
import { Table, TableBody, TableHeader, TableColumn, TableRow, TableCell } from '@nextui-org/table'

export default function ImageUpload() {
  const [file, setFile] = useState<File>()
  const [base64, setBase64] = useState<string>()
  const [detectedList, setDetectedList] = useState<Array<{ key: string, label: string, selected: boolean }>>([])
  const [stepsList, setStepsList] = useState<Array<{ number: number, description: string }>>([])
  const [ingredientList, setIngredientList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isChosen, setIsChosen] = useState(false);
  const [isRecipe, setIsRecipe] = useState(false);

  const handleListItemClick = (key: string) => {
    setDetectedList((prevList) =>
      prevList.map((detectedList) => ({
        ...detectedList,
        selected: detectedList.key === key
      }))
    )
	setIsChosen(true);
  }
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
	setFile(e.target.files?.[0]);
	setDetectedList([]);
	setIsChosen(false);
  }
  const handleRecipeClick = () => {
    setIsLoading(true)
	setIsRecipe(true)
    console.log(detectedList)
    const selectedKey = detectedList.find((detectedList) => detectedList.selected)?.key

    console.log(selectedKey)
    const data = {
      label: selectedKey
    }

    const response = callPostLambda(data)
      .then(result => {
        setStepsList(result.steps)
        setIngredientList(result.ingredients)
        setIsLoading(false)
      })
      .catch(error => {
        console.error(error)
      })
    console.log(response)
  }
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const b64 = await getBase64(file)
      setBase64(b64)
      const id = getHashKey()
      const data = {
        b_image: b64,
        bucket: 'gereral-bucket',
        key: `user-image/${id}.png`
      }

      if (!callPostGatewayApi('s3_upload', data)) {
        console.error("Picture wasn't uploaded to s3")
      }

      callPostGatewayApi('rekognision', data)
        .then(result => {
          interface DetectList {
            name: string
            confidence: number
          }
          const detected: DetectList[] = result.labels

          const dictionaryArray: Array<{ key: string, label: string, selected: boolean }> = []
          detected.forEach(element => {
            const dic = {
              key: element.name,
              label: element.name,
              selected: false
            }
            dictionaryArray.push(dic)
          })

          setDetectedList(dictionaryArray)
        })
        .catch(error => {
          console.error(error)
        })
    } catch (e: any) {
      console.error(e)
    }
  }
  return (
		<div className="flex flex-col w-4/5">
		<div className="flex flex-row">
			<Card className="w-full ">
				<CardBody className="text-center">
					<form onSubmit={onSubmit} method='post' encType="multipart/form-data">
						<input
							type="file"
							accept="image/*"
							name="file"
							onChange={(e) => { handleImageUpload(e) }}
						/>
						{file && (
						<Button className="mx-4" type="submit" size="md" >
							Generate Labels
						</Button>
						)}
						{isChosen && (
						<Button className="mx-4" size="md" onClick={handleRecipeClick}>
							Generate Recipe
						</Button>
						)}
					</form>
				</CardBody>
			</Card>
		</div>
		{file && (<div className="flex flex-row my-8">
			<Image
				className="w-full h-full object-cover"
				alt="NextUI hero Image"
				width={600}
				height={300}
				style={{ minWidth: '600px', maxWidth: '500px', maxHeight: '400px'}}
				src={URL.createObjectURL(file)}
			/>
			<Listbox
				items={detectedList}
				aria-label="Dynamic Actions"
				onAction={(key: React.Key) => { handleListItemClick(key as string) }}
			>
				{(item) => (
				<ListboxItem
					key={item.key}
					className={item.selected ? 'text-success' : ''}
					color={item.selected ? 'success' : 'default'}
				>
					<span style={{ fontSize: `1.5em` }}>
            			{item.label}
          			</span>
				</ListboxItem>
				)}
			</Listbox>
		</div>)}
		{isRecipe && (<div>
			<Card>
				<CardBody> Recipe Output
					{isLoading &&
					(<Progress
						size="sm"
						isIndeterminate
						aria-label="Loading..."
						className="max-w-md"
					/>)}
					{ingredientList.length != 0 &&
					(<div>
						<Table aria-label="Example table with dynamic content">
							<TableHeader>
								<TableColumn key="ingredients">Ingredients</TableColumn>
							</TableHeader>
							<TableBody>
								{ingredientList.map((item) =>
								<TableRow key={item}>
									<TableCell>{item}</TableCell>
								</TableRow>
								)}
							</TableBody>
						</Table>
					</div>)}
					{stepsList.length != 0 &&
					(<Accordion>
						{stepsList.map((item) => (
							<AccordionItem key={item.number} aria-label={`Step ${item.number}`} title={`Step ${item.number}`}>
							{item.description}
							</AccordionItem>
						))}
					</Accordion>)}
				</CardBody>
			</Card>
		</div>)}
	</div>
  )
}
