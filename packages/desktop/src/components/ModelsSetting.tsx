import { filesize } from 'filesize'
import { CircleIcon, CheckCircledIcon } from '@radix-ui/react-icons'
import { open } from '@tauri-apps/api/shell'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useConfigStore, useModelsStore } from '@/stores'

export function LocationSetting() {
  const currentModel = useConfigStore((state) => state.data.model)
  const models = useModelsStore((state) => state.models)
  return (
    <>
      {models.map((model) => {
        return (
          <Card key={model.name} className="mb-4">
            <CardHeader>
              <CardTitle
                className={
                  model.reference ? 'cursor-pointer hover:underline' : ''
                }
                onClick={() => {
                  if (model.reference) {
                    open(model.reference).catch(() => {})
                  }
                }}
              >
                {model.title}
              </CardTitle>
              <CardDescription>{model.description}</CardDescription>
            </CardHeader>
            {model.status === 2 ? (
              <CardContent>
                <Progress value={model.progress * 100} className="w-full" />
              </CardContent>
            ) : null}
            <CardFooter className="flex justify-between">
              <div className="ext-sm text-muted-foreground">
                {model.size > 0 ? filesize(model.size) : ''}
              </div>
              {(() => {
                if (model.status === 1) {
                  return <Button disabled>Pending</Button>
                } else if (model.status === 0 || model.status === 4) {
                  return (
                    <Button
                      className="ml-2"
                      onClick={() => {
                        useModelsStore
                          .getState()
                          .update(model.name, (prevModel) => ({
                            ...prevModel,
                            status: 1
                          }))
                      }}
                    >
                      {model.status === 0 ? 'Download' : 'Retry'}
                    </Button>
                  )
                } else if (model.status === 5) {
                  const selected = model.name === currentModel
                  return (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={selected}
                      onClick={() => {
                        useConfigStore
                          .getState()
                          .update({ model: model.name })
                          .catch((err) => {
                            console.log(err)
                          })
                      }}
                    >
                      {selected ? (
                        <CheckCircledIcon className="h-5 w-5" />
                      ) : (
                        <CircleIcon className="h-5 w-5" />
                      )}
                    </Button>
                  )
                }
                return null
              })()}
            </CardFooter>
          </Card>
        )
      })}
    </>
  )
}

export default LocationSetting
