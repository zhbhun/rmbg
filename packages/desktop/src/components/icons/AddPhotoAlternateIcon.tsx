export interface AddPhotoAlternativeIconProps
  extends React.SVGProps<SVGSVGElement> {}

export function AddPhotoAlternateIcon(props: AddPhotoAlternativeIconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      height="1em"
      width="1em"
    >
      <path d="M212-172q-24.75 0-42.375-17.625T152-232v-496q0-24.75 17.625-42.375T212-788h328v28H212q-14 0-23 9t-9 23v496q0 14 9 23t23 9h496q14 0 23-9t9-23v-328h28v328q0 24.75-17.625 42.375T708-172H212Zm488-468v-80h-80v-28h80v-80h28v80h80v28h-80v80h-28ZM298-306h332L528-442 428-318l-64-74-66 86ZM180-760v560-560Z" />
    </svg>
  )
}

export default AddPhotoAlternateIcon
